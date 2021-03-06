'use strict';
var Q = require('q');
var google = require("googleapis");
var axios = require('axios');
var getToken = function(){
  let accessToken = "";
  let defer = Q.defer();

  // Load the service account key JSON file.
  var serviceAccount = require("../"+process.env.firebaseServiceAccount);

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
    axios.get(process.env.firebaseUrl+"/crawlq.json?orderBy=\"status\"&equalTo=\"SCHEDULED\"",{
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

var getPCrawlQ = function(){
  console.log("in getPCrawlQ");
  let defer = Q.defer();
  getToken().then(accessToken => {
    console.log("AccessToken", accessToken);
    axios.get(process.env.firebaseUrl+"/pcrawlq.json?orderBy=\"status\"&equalTo=\"SCHEDULED\"",{
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
      console.log("Failed getting pcrawlQ "+website.siteKey);
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
      request.url= process.env.firebaseUrl+"/websites.json?orderBy=\"status\"&equalTo=\"COMPLETED\"";
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


      axios.get(process.env.firebaseUrl+"/recrawlq.json?orderBy=\"siteKey\"&equalTo=\""+website.id+"\"",{
        "headers" : {'Authorization':"Bearer "+accessToken}
      }).then(resp => {
        if(Object.keys(resp.data).length == 0){
          axios.post(process.env.firebaseUrl+"/recrawlq.json",{
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
    axios.get(process.env.firebaseUrl+"/recrawlq.json?&orderBy=\"status\"&equalTo=\"SCHEDULED\"",{
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

var getUserAccounts = function(){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get(process.env.firebaseUrl+"/user-preferences.json",{
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

var getActiveCustomers = function(){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get(process.env.firebaseUrl+"/user-preferences.json?orderBy=\"status\"&equalTo=\"ACTIVE\"",{
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
      console.log("Failed getting active customers",err);
      defer.reject(err);
    });
  });

  return defer.promise;
}

var updateAccountStatus = function(userId,status){
  let defer = Q.defer();
  let updates = {'status' : status};

  if(status == "ACTIVE"){
    updates.activationDate = Date.now();
  }
  else if(status == "SUSPENDED"){
    updates.suspendedDate = Date.now();
  }
  else if(status == "DEACTIVATED"){
    updates.deactivationDate = Date.now();
  }
  getToken().then(accessToken => {
    axios.patch(process.env.firebaseUrl+"/user-preferences/"+userId+".json",updates,{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      defer.resolve(resp);
      console.log("success");
    })
    .catch(err => {
      console.log("Failed updating account status "+userId,err);
      defer.reject(err);
    });
  });

  return defer.promise;
}
var subscribeForTrial = function(userId,email){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get(process.env.firebaseUrl+"/user-preferences/"+userId+".json",{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      console.log(resp.data);
      if(resp.data && resp.data.status && resp.data.status == 'ACTIVE'){
        defer.reject("user already active");
      }
      else {
        axios.patch(process.env.firebaseUrl+"/user-preferences/"+userId+".json",{
          'email' : email,
          'status': 'TRIAL',
          'trial': {
            startDate: Date.now(),
            endDate: (new Date()).setTime((new Date()).getTime() + 24 * 60 * 60 * 60 * 1000)
          }
        },{
          "headers" : {'Authorization':"Bearer "+accessToken}
        })
        .then(trialResp => {
          defer.resolve(trialResp);
        })
        .catch(err=> {
          defer.reject(err);
        });
      }
      defer.resolve(resp);
      console.log("success");
    })
    .catch(err => {
      console.log("Failed updating account status "+userId,err);
      defer.reject(err);
    });
  });

  return defer.promise;
}

var activateAccount = function(userId,customerId){
  let defer = Q.defer();
  let updates = {'status' : "ACTIVE"};

  updates.activationDate = Date.now();

  updates.customerId = customerId;

  getToken().then(accessToken => {
    axios.patch(process.env.firebaseUrl+"/user-preferences/"+userId+".json",updates,{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      defer.resolve(resp);
      console.log("success");
    })
    .catch(err => {
      console.log("Failed updating account status "+userId,err);
      defer.reject(err);
    });
  });

  return defer.promise;
}

var updateAccountNextChargeDate = function(userId){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.patch(process.env.firebaseUrl+"/user-preferences/"+userId+".json",{'nextChargeDate':Date.now()+2628000000},{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      defer.resolve(resp);
      console.log("success");
    })
    .catch(err => {
      console.log("Failed updating account status "+userId,err);
      defer.reject(err);
    });
  });

  return defer.promise;
}

var getWebsite = function(siteId){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get(process.env.firebaseUrl+"/websites/"+siteId+".json",{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      console.log("success",resp);
      defer.resolve(resp.data);
    })
    .catch(err => {
      console.log("Failed updating account status "+userId,err);
      defer.reject(err);
    });
  });

  return defer.promise;
}

var getWebsitesByUserId = function(userId){
  let defer = Q.defer();
  getToken().then(accessToken => {
    axios.get(process.env.firebaseUrl+"/websites.json?orderBy=\"userId\"&equalTo=\""+userId+"\"",{
      "headers" : {'Authorization':"Bearer "+accessToken}
    }).then(resp => {
      console.log("success",resp);
      defer.resolve(resp.data);
    })
    .catch(err => {
      console.log("Failed getting websites for "+userId,err);
      defer.reject(err);
    });
  });

  return defer.promise;
}

module.exports = {
  getCrawlQ : getCrawlQ,
  getPCrawlQ : getPCrawlQ,
  subscribeForTrial : subscribeForTrial,
  getToken : getToken,
  getCompletedWebsites : getCompletedWebsites,
  queueReCrawl : queueReCrawl,
  getReCrawlQ : getReCrawlQ,
  activateAccount : activateAccount,
  getUserAccounts : getUserAccounts,
  updateAccountStatus : updateAccountStatus,
  getWebsite : getWebsite,
  getWebsitesByUserId : getWebsitesByUserId,
  getActiveCustomers : getActiveCustomers,
  updateAccountNextChargeDate : updateAccountNextChargeDate
}
