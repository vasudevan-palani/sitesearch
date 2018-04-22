'use strict';
var config = require('./config/config');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var payments = require("./payments/payments.js");

var cloudwatch = new AWS.CloudWatch();

var sendMetricData = function(siteId){
  var params = {
	"MetricData": [{
		"MetricName": "searchRequests",
		"Dimensions": [{
			"Name": "website",
			"Value": siteId
		}],
		"Value": 1
	}],
	"Namespace": "sitesearch"
};
    cloudwatch.putMetricData(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
}

module.exports.welcome = (event, context, callback) => {
  const response = {
    message : "Welcome to SiteSearch API"
  };

  callback(null, response);
};

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
    sendMetricData(siteId);
    callback(null,{'status' : { 'code' : 0 },'results':response.data});
  })
  .catch((response)=>{
    console.log(response);
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}


module.exports.search = (event, context, callback) => {

  let query = event.params['querystring']['q'];
  let siteId = event.params['querystring']['siteId']
  let countOnly = event.params['querystring']['countOnly']

  if(query == null || query == undefined){
    query = "*";
  }

  let params = {
      "query" : { "multi_match" : {"query":query,"fields":["*title*^3","content","meta*"] } }
  }

  let awsurl = "http://"+config.aws.host;

  if(countOnly){
    awsurl = awsurl+"/"+siteId + "/_count"
    params = {

    }
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
    sendMetricData(siteId);
    callback(null,{'status' : { 'code' : 0 },'results':response.data});
  })
  .catch((response)=>{
    console.log(response);
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

  console.log(event);

  payments.createCustomer(request).then((response)=> {
    console.log("created customer successfully",response);

    payments.subscribe({customerid : response.customerid,stripetoken:response.cardid, plan:request.plan}).then((subscription)=>{
      callback(null,{'status' : { 'code' : 0 },'results':subscription});
    })
    .catch((subscriptionerr)=>{
      console.log(subscriptionerr);
      callback(null,{'status' : { 'code' : -1 }});
    });
  })
  .catch((error)=>{
    console.log(error);
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
