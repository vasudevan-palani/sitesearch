var config = require('../config/config');
var metricHandler = require('./metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var Q = require('q');
var cloudwatch = new AWS.CloudWatch();

var getHighLight = function(content,meta_description,query){
  let highlight = "";
  let l_meta_description = meta_description!=undefined ? meta_description:"";
  let l_content = content!=undefined ? content:"";

  let queryStrings = query.split(/\s/);

  let h_meta_description = l_meta_description;
  let h_content = l_content;

  queryStrings.forEach(query => {
    h_meta_description = h_meta_description.replace(new RegExp("[\\s+]"+query+"[\\s+]","gi"),function(match){
      return "<em>"+match+"</em>";
    });

    h_content = h_content.replace(new RegExp("[\\s+]"+query+"[\\s+]","gi"),function(match){
      return "<em>"+match+"</em>";
    });
  })

  let firstQuery = queryStrings[0];

  if(h_meta_description.toLowerCase().indexOf(firstQuery.toLowerCase()) != -1){
    highlight = highlight + h_meta_description;
  }else if (h_content.toLowerCase().indexOf(firstQuery.toLowerCase()) != -1){
    let index = h_content.toLowerCase().indexOf(firstQuery.toLowerCase());
    let startIndex = 0;
    if(index > 14){
      startIndex = index - 14;
    }
    if(h_content.length > 300){
      highlight = highlight + h_content.substr(startIndex, 400);
    }
    else {
      highlight = h_content;
    }

  }

  if(highlight == ""){
    highlight = h_content.substr(0,300);
  }
  return highlight;
}

module.exports.search = (event, context, callback) => {

  let query = event.params['querystring']['q'];
  let siteId = event.params['querystring']['siteId'];
  let lang = event.params['querystring']['lang'];
  let fromIndex = event.params['querystring']['from'];
  let size = event.params['querystring']['size'];

  if(query == null || query == undefined){
    query = "*";
  }

  let params = {};

  let queryObject = {
      "multi_match" : {"query":query,"fields":["*title*^3","content","meta*"] }
  }

  if(lang != null){
    queryObject = {
      "bool":{
         "must":[
            {
               "multi_match":{
                  "query":query,
                  "fields":[
                     "*title*^3",
                     "content",
                     "meta*"
                  ]
               }
            },
            {
               "match":{
                  "lang":lang
               }
            }
         ]
      }
    }
  }

  params.query = queryObject;

  if(size != null){
    params.size = size;
  }

  if(fromIndex != null){
    params.from = fromIndex;
  }

  params._source = ["title","url","content","lang","meta_description"];

  let awsurl = "http://"+config.aws.host;

  awsurl = awsurl+"/"+siteId + "/_search"

  let awspath = "";
  awspath = "/"+siteId + "/_search"

  let request = {
    host: config.aws.host,
    path: awspath,
    service: config.aws.service, region: config.aws.region
  }
  request.method= 'POST';
  request.url= awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {'Content-Type':"application/json"};
  let signedRequest = aws4.sign(request);
  axios(request)
  .then((response)=>{
    metricHandler.sendMetricData(siteId);
    let hits = [];

    let total = 0;
    if(response.data.count != null){
      total = response.data.count;
    }
    if(response.data.hits != null){
      total = response.data.hits.total;
      response.data.hits.hits.forEach(hit => {

        hit._source.highlight = getHighLight(hit._source.content,hit._source.meta_description,query);

        hits.push(hit._source);
      });
    }

    callback(null,{
      'status' : { 'code' : 0 },
      'total' : total,
      'results':hits
    });
  })
  .catch((response)=>{
    console.log(response);
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}

module.exports.count = (event, context, callback) => {

  let siteId = event.params['querystring']['siteId'];

  let  query = "*";

  let params = {};

  let awsurl = "http://"+config.aws.host;

  awsurl = awsurl+"/"+siteId + "/_count"

  let awspath = "";
  awspath = "/"+siteId + "/_count"

  let request = {
    host: config.aws.host,
    path: awspath,
    service: config.aws.service, region: config.aws.region
  }
  request.method= 'POST';
  request.url= awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {'Content-Type':"application/json"};
  let signedRequest = aws4.sign(request);
  console.log(request,params);
  axios(request)
  .then((response)=>{
    let hits = [];

    let total = 0;
    if(response.data.count != null){
      total = response.data.count;
    }

    callback(null,{
      'status' : { 'code' : 0 },
      'total' : total
    });
  })
  .catch((response)=>{
    console.log(response);
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}

module.exports.pages = (event, context, callback) => {

  let from = event.params['querystring']['from'];
  let siteId = event.params['querystring']['siteId'];
  let size = event.params['querystring']['size'];

  let params = {
      "from" : from,
      "size" : size,
      "_source" : ["url"]
  };

  let awsurl = "http://"+config.aws.host;

  awsurl = awsurl+"/"+siteId + "/_search";

  let awspath = "";
  awspath = "/"+siteId + "/_search";

  let request = {
    host: config.aws.host,
    path: awspath,
    service: config.aws.service, region: config.aws.region
  }
  request.method= 'POST';
  request.url= awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {'Content-Type':"application/json"};

  let signedRequest = aws4.sign(request);
  console.log(request,params);
  axios(request)
  .then((response)=>{
    console.log("searchrequest "+siteId);
    callback(null,{'status' : { 'code' : 0 },'results':response.data});
  })
  .catch((response)=>{
    console.log(response);
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}
