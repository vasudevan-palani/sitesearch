'use strict';
var config = require('./config/config');
var axios = require('axios');
var aws4 = require('aws4');
var payments = require("./payments/payments.js");


module.exports.welcome = (event, context, callback) => {
  const response = {
    message : "Welcome to SiteSearch API"
  };

  callback(null, response);
};

module.exports.search = (event, context, callback) => {

  let query = event.params['querystring']['q'];
  let siteId = event.params['querystring']['siteId']
  let countOnly = event.params['querystring']['countOnly']

  let params = {
      "query" : { "match" : {"content":"*"+query+"*"} }
  }

  let awsurl = "http://"+config.aws.host;

  if(countOnly){
    awsurl = awsurl+"/"+siteId + "/_count"
  }
  else {
    awsurl = awsurl+"/"+siteId + "/_search"
  }

  let awspath = "";
  if(countOnly){
    awspath = "/"+siteId + "/_count"
  }
  else {
    awspath = "/"+siteId + "/_search"
  }

  let request = {
    host: config.aws.host,
    method: 'GET',
    url: awsurl,
    path: awspath,
    service: config.aws.service, region: config.aws.region
  }

  let signedRequest = aws4.sign(request,
  {
      // assumes user has authenticated and we have called
      // AWS.config.credentials.get to retrieve keys and
      // session tokens
      secretAccessKey: process.env["SECRET_ACCESS_KEY"],
      accessKeyId: process.env["ACCESS_KEY_ID"]
  });
  axios(request,params)
  .then(function(response){
    console.log("searchrequest "+siteId);
    callback(null,{'status' : { 'code' : 0 },'results':response.data});
  })
  .catch(function(response){
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}

module.exports.invoices = (event, context, callback) => {

  let customerid = event.params['querystring']['customerid'];

  payments.invoices(customerid).then(function(invoices) {

      callback(null,{'status' : { 'code' : 0 },'results':invoices});
    })
    .catch(function(error){
      callback(null,{'status' : { 'code' : -1 }});
    });

}

module.exports.cards = (event, context, callback) => {

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

  payments.createCustomer(request).then(function(response) {
    req.body.customerid = response.customerid;
    if(response.cardid){
      req.body.stripetoken = response.cardid;
    }
    payments.subscribe(request).then(function(subscription){
      callback(null,{'status' : { 'code' : 0 },'results':subscription});
    })
    .catch(function(err){
      callback(null,{'status' : { 'code' : -1 }});
    });
  })
  .catch(function(error){
    callback(null,{'status' : { 'code' : -1 }});
  });

}

module.exports.customer = (event, context, callback) => {

  let customerid = event.params['querystring']['customerid'];

  payments.retrieveCustomer(customerid).then(function(customer) {
    callback(null,{'status' : { 'code' : 0 },'customer':customer});
  })
  .catch(function(error){
    callback(null,{'status' : { 'code' : -1 }});
  });

}
