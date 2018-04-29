var config = require('../config/config');
var metricHandler = require('../lib/metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var Q = require('q');
var cloudwatch = new AWS.CloudWatch();

var website = require("../lib/website.js");

module.exports.search = (event, context, callback) => {
  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/search/error" },'required fields empty'});
    return;
  }
  let query = event.params['querystring']['q'];
  let siteId = event.params['querystring']['siteId'];
  let lang = event.params['querystring']['lang'];
  let fromIndex = event.params['querystring']['from'];
  let size = event.params['querystring']['size'];

  website.search(query,siteId,lang,fromIndex,size).then(
    res => {
      callback(null,{
        'status' : { 'code' : 0 },
        'total' : res.total,
        'results':res.hits
      });
    }
  ).catch(err => {
    callback(null,{'status' : { 'code' : "site/search/error" },'context':err.data});
  });

}

module.exports.count = (event, context, callback) => {
  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/count/error" },'required fields empty'});
    return;
  }

  let siteId = event.params['querystring']['siteId'];

  website.count(siteId)
  .then((response)=>{

    callback(null,{
      'status' : { 'code' : 0 },
      'total' : response
    });
  })
  .catch((response)=>{
    console.log(response);
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}

module.exports.pages = (event, context, callback) => {

  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/pages/error" },'required fields empty'});
    return;
  }

  let from = event.params['querystring']['from'];
  let siteId = event.params['querystring']['siteId'];
  let size = event.params['querystring']['size'];

  website.pages(from,size,siteId)
  .then((results)=>{
    console.log("searchrequest "+siteId);
    callback(null,{'status' : { 'code' : 0 },'results':results});
  })
  .catch((response)=>{
    console.log(response);
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}
