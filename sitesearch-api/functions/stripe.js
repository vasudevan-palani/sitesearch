var config = require('../config/config');
var metricHandler = require('../lib/metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var q = require('q');
var payments = require("../lib/payments.js");

module.exports.webhook = (event, context, callback) => {
  console.log(event);
}

module.exports.invoices = (event, context, callback) => {

  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/invoices/error" },'msg':'required fields empty'});
    return;
  }

  let customerid = event.params['querystring']['customerid'];

  payments.invoices(customerid).then(function(invoices) {

      callback(null,{'status' : { 'code' : 0 },'results':invoices});
    })
    .catch(function(error){
      callback(null,{'status' : { 'code' : -1 }});
    });

}

module.exports.cards = (event, context, callback) => {

  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/cards/error" },'msg':'required fields empty'});
    return;
  }

  let customerid = event.params['querystring']['customerid'];

  payments.list(customerid).then(function(cards) {
      callback(null,{'status' : { 'code' : 0 },'results':cards});
    })
    .catch(function(error){
      callback(null,{'status' : { 'code' : -1 }});
    });

}


module.exports.charge = (event, context, callback) => {

  let request = event.request;

  console.log(event);

  payments.createCustomer(request).then((response)=> {
    console.log("created customer successfully",response);
    callback(null,{'status' : { 'code' : 0 },'results':response});
  })
  .catch((error)=>{
    console.log(error);
    callback(null,{'status' : { 'code' : -1 }});
  });

}

module.exports.customer = (event, context, callback) => {
  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/customer/error" },'msg':'required fields empty'});
    return;
  }

  let customerid = event.params['querystring']['customerid'];

  payments.retrieveCustomer(customerid).then(function(customer) {
    callback(null,{'status' : { 'code' : 0 },'customer':customer});
  })
  .catch(function(error){
    callback(null,{'status' : { 'code' : -1 }});
  });

}
