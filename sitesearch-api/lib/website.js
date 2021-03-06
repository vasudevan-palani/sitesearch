var q = require('q');
var metricHandler = require('../lib/metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');

var getHighLight = function(content, meta_description, query) {
  let highlight = "";
  let l_meta_description = meta_description != undefined ? meta_description : "";
  let l_content = content != undefined ? content : "";

  let queryStrings = query.split(/\s/);

  let h_meta_description = l_meta_description;
  let h_content = l_content;

  queryStrings.forEach(query => {
    h_meta_description = h_meta_description.replace(new RegExp("[\\s+]" + query + "[\\s+]", "gi"), function(match) {
      return "<em>" + match + "</em>";
    });

    h_content = h_content.replace(new RegExp("[\\s+]" + query + "[\\s+]", "gi"), function(match) {
      return "<em>" + match + "</em>";
    });
  })

  let firstQuery = queryStrings[0];

  if (h_meta_description.toLowerCase().indexOf(firstQuery.toLowerCase()) != -1) {
    highlight = highlight + h_meta_description;
  } else if (h_content.toLowerCase().indexOf(firstQuery.toLowerCase()) != -1) {
    let index = h_content.toLowerCase().indexOf(firstQuery.toLowerCase());
    let startIndex = 0;
    if (index > 14) {
      startIndex = index - 14;
    }
    if (h_content.length > 300) {
      highlight = highlight + h_content.substr(startIndex, 400);
    } else {
      highlight = h_content;
    }

  }

  if (highlight == "") {
    highlight = h_content.substr(0, 300);
  }
  return highlight;
}

module.exports.search = function(query, siteId, lang, fromIndex, size,highlight,suggest) {
  console.log(process.env);
  let defer = q.defer();
  if (query == null || query == undefined) {
    query = "*";
  }

  let params = {};

  let queryObject = {
    "multi_match": {
      "query": query,
      "fields": ["*title*^3", "content", "meta*"]
    }
  }

  if (lang != null) {
    queryObject = {
      "bool": {
        "must": [{
            "multi_match": {
              "query": query,
              "fields": [
                "*title*^3",
                "content",
                "meta*"
              ]
            }
          },
          {
            "match": {
              "lang": lang
            }
          }
        ]
      }
    }
  }

  params.query = queryObject;

  if(highlight == true){
    params.highlight = {
                          "fields": {
                              "*": {}
                          }
                      };
  }

  if(suggest == true){
    params.suggest = {
                        "content-suggest" : {
                            "text" : query,
                            "term" : {
                                "field" : "content"
                            }
                        },
                        "title-suggest" : {
                            "text" : query,
                            "term" : {
                                "field" : "title"
                            }
                        }
                    };
  }


  if (size != null) {
    params.size = size;
  }

  if (fromIndex != null) {
    params.from = fromIndex;
  }

  params._source = ["title", "url", "content", "lang", "meta_description"];

  let awsurl = "http://" + process.env.esHost;

  awsurl = awsurl + "/" + siteId + "/_search"

  let awspath = "";
  awspath = "/" + siteId + "/_search"

  let request = {
    host: process.env.esHost,
    path: awspath,
    service: process.env.esService,
    region: process.env.esRegion
  }
  request.method = 'POST';
  request.url = awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {
    'Content-Type': "application/json"
  };
  let signedRequest = aws4.sign(request);
  axios(request)
    .then((response) => {
      metricHandler.updateRequestCount(siteId);
      let hits = [];

      let total = 0;
      if (response.data.count != null) {
        total = response.data.count;
      }
      if (response.data.hits != null) {
        total = response.data.hits.total;

        if(total == 0){
          metricHandler.updateRequestZeroCount(siteId,query);
        }
        response.data.hits.hits.forEach(hit => {
          hit._source.highlight = hit.highlight;
          hits.push(hit._source);
        });


      }

      let suggestions = [];

      let responseData = response.data;

      if(responseData && responseData.suggest && responseData.suggest["content-suggest"] &&  responseData.suggest["content-suggest"].length >0 &&
          responseData.suggest["content-suggest"][0].options && responseData.suggest["content-suggest"][0].options.length > 0
        )
        {
          responseData.suggest["content-suggest"][0].options.forEach(contentSuggestion => {
            suggestions.push(contentSuggestion.text);
          });
        }

        if(responseData.suggest && responseData.suggest["title-suggest"] &&  responseData.suggest["title-suggest"].length >0 &&
            responseData.suggest["title-suggest"][0].options && responseData.suggest["title-suggest"][0].options.length > 0
          )
          {
            responseData.suggest["title-suggest"][0].options.forEach(titleSuggestion => {
              suggestions.push(titleSuggestion.text);
            });
          }



      defer.resolve({
        total: total,
        hits: hits,
        suggestions : suggestions.filter( (value, index, self) => {
                          return self.indexOf(value) === index;
                      })
      });
    })
    .catch((response) => {
      console.log(response);
      defer.reject(response);
    });

  return defer.promise;
}

module.exports.count = function(siteId) {
  let defer = q.defer();

  let query = "*";

  let params = {};

  let awsurl = "http://" + process.env.esHost;

  awsurl = awsurl + "/" + siteId + "/_count"

  let awspath = "";
  awspath = "/" + siteId + "/_count"

  let request = {
    host: process.env.esHost,
    path: awspath,
    service: process.env.esService,
    region: process.env.esRegion
  }
  request.method = 'POST';
  request.url = awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {
    'Content-Type': "application/json"
  };
  let signedRequest = aws4.sign(request);
  axios(request)
    .then((response) => {
      let hits = [];

      let total = 0;
      if (response.data.count != null) {
        total = response.data.count;
      }
      console.log("page count",siteId,total);
      defer.resolve(total);
    })
    .catch((response) => {
      defer.reject(response);
    });

  return defer.promise;
}


module.exports.pages = function(from, size, siteId) {
  let defer = q.defer();
  let params = {
    "from": from,
    "size": size,
    "_source": ["url"]
  };

  let awsurl = "http://" + process.env.esHost;

  awsurl = awsurl + "/" + siteId + "/_search";

  let awspath = "";
  awspath = "/" + siteId + "/_search";

  let request = {
    host: process.env.esHost,
    path: awspath,
    service: process.env.esService,
    region: process.env.esRegion
  }
  request.method = 'POST';
  request.url = awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {
    'Content-Type': "application/json"
  };

  let signedRequest = aws4.sign(request);
  console.log(request, params);
  axios(request)
    .then((response) => {
      console.log("searchrequest " + siteId);
      defer.resolve(response.data);
    })
    .catch((response) => {
      defer.reject(response);
    });

  return defer.promise;
}


module.exports.updateConfigInS3 = function(website) {
  let defer = q.defer();
  let s3 = new AWS.S3();

  let includesRegEx = "";
  let excludesRegEx = "";

  let websiteNutchSiteXmlFile = "websites/" + website.id + "/nutch-site.xml";

  if (website.preferences != undefined) {
    if (website.preferences.includes != undefined) {
      website.preferences.includes.forEach(exp => {
        includesRegEx = includesRegEx + "+" + exp + "\n";
      });
    }
    if (website.preferences.excludes != undefined) {
      website.preferences.excludes.forEach(exp => {
        excludesRegEx = excludesRegEx + "-" + exp + "\n";
      });
    }
  }

  let regExps = includesRegEx + excludesRegEx +
    "-^(file|ftp|mailto):" + "\n" +
    "-\.(gif|GIF|jpg|JPG|png|PNG|ico|ICO|css|CSS|sit|SIT|eps|EPS|wmf|WMF|zip|ZIP|ppt|PPT|mpg|MPG|xls|XLS|gz|GZ|rpm|RPM|tgz|TGZ|mov|MOV|exe|EXE|jpeg|JPEG|bmp|BMP|js|JS)$"+"\n"+
    "-[?*!@=]"+"\n"+
    "-.*(/[^/]+)/[^/]+\\1/[^/]+\\1/" +"\n" +
    "+.";

  console.log(regExps);

  let siteXml =
`<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
  <property>
    <name>urlfilter.regex.rules</name>
    <value>${regExps}</value>
    <description>Name of file on CLASSPATH containing regular expressions
    used by urlfilter-regex (RegexURLFilter) plugin.</description>
  </property>
</configuration>
  `;

  console.log(siteXml);

  let params = {
    Body: siteXml ,
    Bucket: "sitesearch-emr-archives",
    Key: websiteNutchSiteXmlFile
  };
  s3.putObject(params, function(err, data) {
    console.log(err,data);
    if (err){
      defer.reject(data);
      console.log(err, err.stack);
    }
    else {
      defer.resolve(data);
      console.log(data);
    }
  });

  return defer.promise;
}
