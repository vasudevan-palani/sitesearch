'use strict';
var config = require('./config/config');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var Q = require('q');
var payments = require("./functions/payments.js");
var websiteHandler = require("./functions/website.js");
var analyticsHandler = require("./functions/analytics.js");
var stripeHandler = require("./functions/stripe.js");

var cloudwatch = new AWS.CloudWatch();

var accessToken = "";
var getToken = function(){
  let defer = Q.defer();

  var google = require("googleapis");

  // Load the service account key JSON file.
  var serviceAccount = require("./opensearch-2a0db-firebase-adminsdk-c87oh-80d58a586e.json");

  // Define the required scopes.
  var scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/firebase.database"
  ];

  // Authenticate a JWT client with the service account.
  var jwtClient = new google.google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    scopes
  );

  // Use the JWT client to generate an access token.
  jwtClient.authorize(function(error, tokens) {
    if (error) {
      console.log("Error making request to generate access token:", error);
      defer.reject(error);
    } else if (tokens.access_token === null) {
      console.log("Provided service account does not have permission to generate access tokens");
      defer.reject("Provided service account does not have permission to generate access tokens");
    } else {
      accessToken = tokens.access_token;
      defer.resolve(accessToken);
    }
  });

  return defer.promise;
}

module.exports.welcome = (event, context, callback) => {
  const response = {
    message : "Welcome to SiteSearch API"
  };

  callback(null, response);
};


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
var getCrawlQ = function(){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get("https://opensearch-2a0db.firebaseio.com/crawlq.json?orderBy=\"status\"&equalTo=\"SCHEDULED\"",{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      if(Object.keys(resp.data).length > 0){
        defer.resolve(resp.data);
      }
      else {
        console.log("Q is empty");
        defer.reject(resp.data);
      }

    })
    .catch(err => {
      console.log("Failed creating recrawlQ "+website.siteKey);
      defer.reject(err);
    });
  });

  return defer.promise;
}
module.exports.crawlScheduler = (event, context, callback) => {

  //Check for any websites with scheduled in recrawlq
  //
  getCrawlQ().then(queueList => {
    let emr = new AWS.EMR();

    let s3 = new AWS.S3();
    s3.getObject({
      "Bucket" : "sitesearch-emr-archives",
      "Key" : "sitesearch-conf/emr-config-crawl-sdk.json"
    },(err,data)=>{
      console.log(err,data.Body.toString());
      if(data != null && data.Body != null){
        let config = JSON.parse(data.Body.toString());
        emr.runJobFlow(config, (err,data)=>{
          if(err != null){
            console.log("JobFlow creation failed ", err)
          }
          else {
            console.log("JobFlow created with id",data);
            callback(null,data);
          }
        });
      }
    });
  });
}

var getCompletedWebsites = function(){
  let defer = Q.defer();
  getToken().then(accessToken => {
    console.log(accessToken);
      let request = {};
      request.method= 'GET';
      request.url= "https://opensearch-2a0db.firebaseio.com/websites.json?orderBy=\"status\"&equalTo=\"COMPLETED\"";
      request.headers = {'Authorization':"Bearer "+accessToken};
      axios(request).then(resp => {
        console.log("Succesfully retrived websites",resp.data);
        defer.resolve(resp.data);
      })
      .catch(err => {
        console.log("Failed retrived websites",err);
        defer.reject(err);
      });
    });
  return defer.promise;
}

var standardPlanMillSeconds = 604800000;

var basicPlanInMillSeconds = standardPlanMillSeconds/2;

var retryInMillSeconds = 21600000;

var queueReCrawl = function(website){
  let defer = Q.defer();
  getToken().then(accessToken => {
    console.log("queueReCrawl accessToken",accessToken,website);


      axios.get("https://opensearch-2a0db.firebaseio.com/recrawlq.json?orderBy=\"siteKey\"&equalTo=\""+website.id+"\"",{
        "headers" : {'Authorization':"Bearer "+accessToken}
      }).then(resp => {
        if(Object.keys(resp.data).length == 0){
          axios.post("https://opensearch-2a0db.firebaseio.com/recrawlq.json",{
            'siteKey' : website.id,
            'created' : Date.now(),
            'crawlTime' : Date.now(),
            'status' : 'SCHEDULED',
            'urls' : []
          },{
            "headers" : {'Authorization':"Bearer "+accessToken}
          }).then(resp => {
            console.log("Website Queued.",resp.data,website.id);
            defer.resolve(resp.data);
          })
          .catch(err => {
            console.log("Failed creating recrawlQ "+website.siteKey);
            defer.reject(err);
          });
        }
        else {
          console.log("Website already queued.");
          defer.reject("Website already queued.");
        }
      })
      .catch(err=>{
          console.log("Failed to check if queued already.",err);
          defer.reject("Failed to check if queued already.",err);
      })


    });
  return defer.promise;
}

module.exports.recrawlScheduler = (event, context, callback) => {
  getCompletedWebsites().then(websites => {
    if(Object.keys(websites).length > 0){
      let allUpdates = [];
      Object.keys(websites).forEach(websiteKey => {
        let website = websites[websiteKey];
        console.log(website);
        if(website.lastCrawlTime == "None"){
          allUpdates.push(queueReCrawl(website));
        }
        else if (website.planId == "basic-monthly" && website.status=="COMPLETED" && website.lastCrawlTime + basicPlanInMillSeconds < Date.now()){
          allUpdates.push(queueReCrawl(website));
        }
        else if (website.planId == "standard-monthly" && website.status=="COMPLETED" && website.lastCrawlTime + standardPlanMillSeconds < Date.now()){
          allUpdates.push(queueReCrawl(website));
        }
        else if (website.planId == "basic-monthly" && website.status=="FAILED" && website.lastCrawlTime + retryInMillSeconds < Date.now()){
          allUpdates.push(queueReCrawl(website));
        }
        else if (website.planId == "standard-monthly" && website.status=="FAILED" && website.lastCrawlTime + retryInMillSeconds < Date.now()){
          allUpdates.push(queueReCrawl(website));
        }
      });
      allUpdates.allSettled(allUpdates).then(responses => {
        callback(null, responses);
      });
    }
  });
};

var getReCrawlQ = function(){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get("https://opensearch-2a0db.firebaseio.com/recrawlq.json?&orderBy=\"status\"&equalTo=\"SCHEDULED\"",{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      console.log(resp);
      if(Object.keys(resp.data).length > 0){
        defer.resolve(resp.data);
      }
      else {
        console.log("Q is empty");
        defer.reject(resp.data);
      }

    })
    .catch(err => {
      console.log("Failed creating recrawlQ "+website.siteKey);
      defer.reject(err);
    });
  });

  return defer.promise;
}


module.exports.recrawlEMRScheduler = (event, context, callback) => {

  //Check for any websites with scheduled in recrawlq
  //
  getReCrawlQ().then(queueList => {
    let emr = new AWS.EMR();

    let s3 = new AWS.S3();
    s3.getObject({
      "Bucket" : "sitesearch-emr-archives",
      "Key" : "sitesearch-conf/emr-config-recrawl-sdk.json"
    },(err,data)=>{
      console.log(err,data.Body.toString());
      if(data != null && data.Body != null){
        let config = JSON.parse(data.Body.toString());
        emr.runJobFlow(config, (err,data)=>{
          if(err != null){
            console.log("JobFlow creation failed ", err)
          }
          else {
            console.log("JobFlow created with id",data);
            callback(null,data);
          }
        });
      }
    });
  });

}


module.exports.pages = websiteHandler.pages;
module.exports.search = websiteHandler.search;
module.exports.count = websiteHandler.count;
module.exports.analytics = analyticsHandler.analytics;
module.exports.stripe = stripeHandler.stripe;
