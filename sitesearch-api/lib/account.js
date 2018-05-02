var firebaseHandler = require("../lib/firebase.js");
var q = require('q');
var config = require('../config/config');
var AWS = require('aws-sdk');
var website = require("../lib/website.js");
var metric = require("../lib/metric.js")

module.exports.validateTrialAccounts = function(){
  let defer = q.defer();

  firebaseHandler.getUserAccounts().then(userAccounts => {
    console.log(userAccounts);
    let allUpdates = [];

    Object.keys(userAccounts).forEach(userAccountKey =>  {

      let userAccount = userAccounts[userAccountKey];
      console.log(userAccountKey);
      if(userAccount != undefined &&
        userAccount.trial != undefined &&
        userAccount.status == "TRIAL" &&
        userAccount.trial.endDate < Date.now()){
        allUpdates.push(firebaseHandler.updateAccountStatus(userAccountKey,'SUSPENDED'));
      }
    });

    q.allSettled(allUpdates).then(responses => {
      defer.resolve(responses);
    })
    .catch(err => {
      defer.reject(err);
    });
  });

  return defer.promise;
}


module.exports.quote = function(userId){
  let defer = q.defer();

  firebaseHandler.getWebsitesByUserId(userId).then(websites => {
    console.log(websites);
    let counts = [];
    let searchRequests = [];

    Object.keys(websites).forEach(websiteKey =>  {

      let websiteObject = websites[websiteKey];
      console.log(websiteObject);
      if(websiteObject != undefined){
        //Get the page count
        //
        counts.push(website.count(websiteKey));
        searchRequests.push(metric.getMetricData(websiteKey));
      }

    });

    let countSum = q.defer();
    q.allSettled(counts).then(responses => {

      let count = 0;
      responses.forEach(response => {
        if(response.value != undefined){
          count = count + response.value;
        }
      });
      console.log("count aggregated responses",responses,count);
      countSum.resolve({count:count});
    })
    .catch(err => {
      countSum.reject(err);
    });

    let requestSum = q.defer();

    q.allSettled(searchRequests).then(responses => {

      let count = 0;
      responses.forEach(response => {
        if(response.value && response.value.total != undefined){
          count = count + response.value.total;
        }
      });
      console.log("searchRequests aggregated responses",responses);
      requestSum.resolve({requests:count});
    })
    .catch(err => {
      requestSum.reject(err);
    });

    q.allSettled([countSum.promise,requestSum.promise]).then(responses => {
      console.log(responses);
      let finalResponse = {};
      responses.forEach(response => {
        if(response.value.count != undefined){
          finalResponse.count = response.value.count;
        }
        if(response.value.requests != undefined){
          finalResponse.requests = response.value.requests;
        }
      });
      console.log("final response",finalResponse);

      let chargingResponse = {count:finalResponse.count,requests:finalResponse.requests};
      let charge = 25;

      if(chargingResponse.count > 5000)
      {
        chargingResponse.count = chargingResponse.count - 5000;
      }
      else {
        chargingResponse.count = 0;
      }


      if(chargingResponse.requests > 100000)
      {
        chargingResponse.requests = chargingResponse.requests - 100000;
      }
      else {
        chargingResponse.requests = 0;
      }

      while(chargingResponse.count > 0){
        charge = charge + 10;
        chargingResponse.count = chargingResponse.count - 1000;
      }

      while(chargingResponse.requests > 0){
        charge = charge + 10;
        chargingResponse.requests = chargingResponse.requests - 100000;
      }

      finalResponse.charge = charge;


      defer.resolve(finalResponse);
    })
    .catch(err => {
      defer.reject(err);
    });;

  });

  return defer.promise;
}
