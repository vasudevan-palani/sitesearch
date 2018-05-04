var config = require('../config/config');
var metric = require('../lib/metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var q = require('q');

module.exports.analytics = (event, context, callback) => {

  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/analytics/error" },'msg':'required fields empty'});
    return;
  }

  let siteId = event.params['querystring']['siteId'];

  let responseBody = {};

  let analyticsRequests = [];
  analyticsRequests.push(metric.getRequestCount(siteId).then(results => {
      responseBody.searchRequests = results;
  }));

  analyticsRequests.push(metric.getRequestZeroResultsCount(siteId).then(zeroResults => {
      responseBody.zeroResults = zeroResults;
  }));

  analyticsRequests.push(metric.getPageCountByLanguage(siteId).then(zeroResults => {
      responseBody.pagesByLang = zeroResults;
  }));

  analyticsRequests.push(metric.getPageCountByHost(siteId).then(zeroResults => {
      responseBody.pagesByHost = zeroResults;
  }));

  q.allSettled(analyticsRequests).then(response => {
    callback(null,{'status' : { 'code' : "0" },'results':responseBody});
  })
  .catch(err => {
      callback(null,{'status' : { 'code' : "sitesearch/analytics/error" },'err':err});
  });
}
