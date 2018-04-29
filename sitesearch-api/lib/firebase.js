'use strict';
var config = require('../config/config');
var Q = require('q');
var google = require("googleapis");
var axios = require('axios');
var getToken = function(){
  let accessToken = "";
  let defer = Q.defer();

  // Load the service account key JSON file.
  var serviceAccount = require("../opensearch-2a0db-firebase-adminsdk-c87oh-80d58a586e.json");

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


var getCrawlQ = function(){
  console.log("in getCrawlQ");
  let defer = Q.defer();
  getToken().then(accessToken => {
    console.log("AccessToken", accessToken);
    axios.get(config.firebase.url+"/crawlq.json?orderBy=\"status\"&equalTo=\"SCHEDULED\"",{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      console.log(resp);
      if(Object.keys(resp.data).length > 0){
        console.log("Queue is of length",resp.data.length);
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

var getCompletedWebsites = function(){
  let defer = Q.defer();
  getToken().then(accessToken => {
    console.log(accessToken);
      let request = {};
      request.method= 'GET';
      request.url= config.firebase.url+"/websites.json?orderBy=\"status\"&equalTo=\"COMPLETED\"";
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

var queueReCrawl = function(website){
  let defer = Q.defer();
  getToken().then(accessToken => {
    console.log("queueReCrawl accessToken",accessToken,website);


      axios.get(config.firebase.url+"/recrawlq.json?orderBy=\"siteKey\"&equalTo=\""+website.id+"\"",{
        "headers" : {'Authorization':"Bearer "+accessToken}
      }).then(resp => {
        if(Object.keys(resp.data).length == 0){
          axios.post(config.firebase.url+"/recrawlq.json",{
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

var getReCrawlQ = function(){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get(config.firebase.url+"/recrawlq.json?&orderBy=\"status\"&equalTo=\"SCHEDULED\"",{
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
module.exports = {
  getCrawlQ : getCrawlQ,
  getToken : getToken,
  getCompletedWebsites : getCompletedWebsites,
  queueReCrawl : queueReCrawl,
  getReCrawlQ : getReCrawlQ
}
