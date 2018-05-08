var metricHandler = require('../lib/metric.js');
var firebaseHandler = require('../lib/firebase.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var Q = require('q');
var cloudwatch = new AWS.CloudWatch();

var website = require("../lib/website.js");

module.exports.search = (event, context, callback) => {
  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/search/error" },'msg':'required fields empty'});
    return;
  }
  let query = event.params['querystring']['q'];
  let siteId = event.params['querystring']['siteId'];
  let lang = event.params['querystring']['lang'];
  let fromIndex = event.params['querystring']['from'];
  let size = event.params['querystring']['size'];
  let highlight = event.params['querystring']['highlight'];
  let suggest = event.params['querystring']['suggest'];

  if(highlight == undefined){
    highlight = true;
  }
  if(suggest == undefined){
    suggest = true;
  }

  website.search(query,siteId,lang,fromIndex,size,highlight,suggest).then(
    res => {
      callback(null,{
        'status' : { 'code' : 0 },
        'total' : res.total,
        'results':res.hits,
        'suggestions' :res.suggestions
      });
    }
  ).catch(err => {
    callback(null,{'status' : { 'code' : "site/search/error" },'context':err.data});
  });

}

module.exports.count = (event, context, callback) => {
  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/count/error" },'msg':'required fields empty'});
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
    callback(null,{'status' : { 'code' : "sitesearch/pages/error" },'msg':'required fields empty'});
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

module.exports.config = (event, context, callback) => {

  let requestBody = event.request;

  if(requestBody.siteId == undefined){
    callback(null,{'status' : { 'code' : "site/config/error" },'msg':'invalid site'});
    return;
  }

  firebaseHandler.getWebsite(requestBody.siteId).then( websiteResp => {
    console.log(websiteResp);
    website.updateConfigInS3(websiteResp).then(updateResp => {
      console.log(updateResp);
      callback(null,{'status' : { 'code' : 0 },'results':updateResp});
    }).catch(updateErr => {
      console.log(updateErr);
      callback(null,{'status' : { 'code' : "site/config/error" },'err':updateErr});
    });
  }).catch(err => {
    console.log("In first catch",err);
    callback(null,{'status' : { 'code' : "site/config/error" },'err':err});
  });
}
