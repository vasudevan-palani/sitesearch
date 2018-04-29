var config = require('../config/config');
var metric = require('../lib/metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var q = require('q');

module.exports.analytics = (event, context, callback) => {

  let siteId = event.params['querystring']['siteId'];

  metric.getMetricData(siteId).then(results => {
        callback(null,{'status' : { 'code' : "0" },'searchRequests':results});
  })
  .catch(err => {
      callback(null,{'status' : { 'code' : "sitesearch/analytics/error" },'err':err});
  });
}
