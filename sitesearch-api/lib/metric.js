var config = require('../config/config');
var q = require('q');

var AWS = require('aws-sdk');
var aws4 = require('aws4');
var axios = require('axios');

var dynamodb = new AWS.DynamoDB();

module.exports.updateRequestCount=function(siteId){
  let curDate = new Date();
  let dateString = curDate.getUTCFullYear()+"-"+(curDate.getUTCMonth()+1)+"-"+curDate.getUTCDate();
  let params = {
    Key : {
      websiteid : {
        S: siteId
      },
      timestamp : {
        S: dateString
      }
    },
    TableName: process.env.RequestCountTable,
    AttributeUpdates: {
      'count' : {
        Action : 'ADD',
        Value : {
          N : '1'
        }
      }
    }
  };
    dynamodb.updateItem(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
}

module.exports.updateRequestZeroCount=function(siteId,searchQuery){
  let curDate = new Date();
  let dateString = curDate.getUTCFullYear()+"-"+(curDate.getUTCMonth()+1)+"-"+curDate.getUTCDate();
  let params = {
    Key : {
      websiteid : {
        S: siteId
      },
      searchQuery : {
        S: searchQuery
      }
    },
    TableName: process.env.RequestZeroResultsTable,
    AttributeUpdates: {
      'timestamp' : {
        Action : 'PUT',
        Value : {
          S : dateString
        }
      },
      'count' : {
        Action : 'ADD',
        Value : {
          N : '1'
        }
      }
    }
  };
    dynamodb.updateItem(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
}

module.exports.getRequestCount = function(siteId){
  let defer = q.defer();
  let curDate = new Date();
  let dateString = curDate.getUTCFullYear()+"-"+(curDate.getUTCMonth()+1);
  let params = {
    ScanFilter:{
      'timestamp' : {
        ComparisonOperator:"BEGINS_WITH",
        AttributeValueList:[
          {S:dateString}
        ]
      },
      'websiteid':{
        ComparisonOperator:"EQ",
        AttributeValueList:[
          {S:siteId}
        ]
      }
    },
    TableName: process.env.RequestCountTable
  };
    dynamodb.scan(params, function(err, data) {
      let items = [];
      let total = 0;
      if (err)
      {
        defer.reject(err);
      }
      else {
        if(data['Items'] && data['Items'].length > 0){
          data['Items'].forEach(item => {
              items.push({timestamp:item.timestamp['S'],count : item.count['N']});
              total = total + parseInt(item.count['N']);
          });
          console.log("search metric ",siteId,{'total':total,'items':items});
          defer.resolve({'total':total,'items':items});
        }
        else {
          defer.reject(err);
        }
      }
    });

    return defer.promise;
}


module.exports.getRequestZeroResultsCount = function(siteId){
  let defer = q.defer();
  let curDate = new Date();
  let dateString = curDate.getUTCFullYear()+"-"+(curDate.getUTCMonth()+1);
  let params = {
    ScanFilter:{
      'timestamp' : {
        ComparisonOperator:"BEGINS_WITH",
        AttributeValueList:[
          {S:dateString}
        ]
      },
      'websiteid':{
        ComparisonOperator:"EQ",
        AttributeValueList:[
          {S:siteId}
        ]
      }
    },
    TableName: process.env.RequestZeroResultsTable
  };
    dynamodb.scan(params, function(err, data) {
      let items = [];
      let total = 0;
      if (err)
      {
        defer.reject(err);
      }
      else {
        if(data['Items'] && data['Items'].length > 0){
          data['Items'].forEach(item => {
              items.push({query:item.searchQuery['S'],count : item.count['N']});
              total = total + parseInt(item.count['N']);
          });
          console.log("request zero results count ",siteId,{'total':total,'items':items});
          defer.resolve({'total':total,'items':items});
        }
        else {
          defer.reject(err);
        }
      }
    });

    return defer.promise;
}

module.exports.getPageCountByHost = function(siteId){
  let defer = q.defer();

  let params = {
    "size": 0,
    "aggs": {
      "group_by_host": {
        "terms": {
          "field": "host.keyword"
        }
      }
    }
  };

  let awsurl = "http://" + config.aws.host;

  awsurl = awsurl + "/" + siteId + "/_search"

  let awspath = "";
  awspath = "/" + siteId + "/_search"

  let request = {
    host: config.aws.host,
    path: awspath,
    service: config.aws.service,
    region: config.aws.region
  }
  request.method = 'POST';
  request.url = awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {
    'Content-Type': "application/json"
  };
  let signedRequest = aws4.sign(request);

  let responseBody = {};
  axios(request)
    .then((response) => {
      if (response.data.aggregations != null &&
        response.data.aggregations.group_by_host != null &&
        response.data.aggregations.group_by_host.buckets) {
        responseBody = response.data.aggregations.group_by_host.buckets;
      }
      console.log("host aggregation",siteId,responseBody);
      defer.resolve(responseBody);
    })
    .catch((response) => {
      console.log("error in host aggregation",response)
      defer.reject(response);
    });

  return defer.promise;
}

module.exports.getPageCountByLanguage = function(siteId){
  let defer = q.defer();

  let params = {
    "size": 0,
    "aggs": {
      "group_by_lang": {
        "terms": {
          "field": "lang.keyword"
        }
      }
    }
  };

  let awsurl = "http://" + config.aws.host;

  awsurl = awsurl + "/" + siteId + "/_search"

  let awspath = "";
  awspath = "/" + siteId + "/_search"

  let request = {
    host: config.aws.host,
    path: awspath,
    service: config.aws.service,
    region: config.aws.region
  }
  request.method = 'POST';
  request.url = awsurl;
  request.body = JSON.stringify(params);
  request.data = params;
  request.headers = {
    'Content-Type': "application/json"
  };
  let signedRequest = aws4.sign(request);

  let responseBody = {};
  axios(request)
    .then((response) => {
      if (response.data.aggregations != null &&
        response.data.aggregations.group_by_lang != null &&
        response.data.aggregations.group_by_lang.buckets) {
        responseBody = response.data.aggregations.group_by_lang.buckets;
      }
      console.log("lang aggregation",siteId,responseBody);
      defer.resolve(responseBody);
    })
    .catch((response) => {
      console.log("error in lang aggregation",response)
      defer.reject(response);
    });


  return defer.promise;
}
