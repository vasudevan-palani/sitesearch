var config = require('../config/config');
var metricHandler = require('./metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var q = require('q');

module.exports.stripe = (event, context, callback) => {
  console.log(event);
}
