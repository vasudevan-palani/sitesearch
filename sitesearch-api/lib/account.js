var firebaseHandler = require("../lib/firebase.js");
var q = require('q');
var config = require('../config/config');
var AWS = require('aws-sdk');

module.exports.validateTrialAccounts = function(){
  let defer = q.defer();

  firebaseHandler.getUserAccounts().then(userAccounts => {
    console.log(userAccounts);
    let allUpdates = [];

    Object.keys(userAccounts).forEach(userAccountKey =>  {

      let userAccount = userAccounts[userAccountKey];
      console.log(userAccountKey);
      if(userAccount.account != undefined &&
        userAccount.account.trial != undefined &&
        userAccount.account.status == "TRIAL" &&
        userAccount.account.trial.endDate < Date.now()){
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
