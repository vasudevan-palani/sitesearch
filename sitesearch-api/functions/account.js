
var account = require("../lib/account.js");
var firebase = require("../lib/firebase.js");
var email = require("../lib/email.js");

module.exports.validateTrialAccounts = (event, context, callback) => {
  account.validateTrialAccounts().then(
    data => {
      callback(null,data);
    }
  )
  .catch(
    err => {
      console.log(err);
      callback(err,null);
    }
  )
};

module.exports.validateSuspendedAccounts = (event, context, callback) => {
  account.validateSuspendedAccounts().then(
    data => {
      callback(null,data);
    }
  )
  .catch(
    err => {
      console.log(err);
      callback(err,null);
    }
  )
};

module.exports.subscribeForTrial = (event, context, callback) => {

  if(!event.request){
    callback(null,{'status' : { 'code' : "sitesearch/analytics/error" },'msg':'required fields empty'});
    return;
  }
  let userId = event.request['userId'];
  let userEmail = event.request['email'];

  firebase.subscribeForTrial(userId,userEmail).then(
    data => {
      email.sendMail("sitesearch.svolve@gmail.com","New user has signed up.","New user - "+userEmail).then(
        data => {
          console.log(data);
          callback(null,data);
        }
      ).catch(
        err => {
          console.log(err);
          callback(err,null);
        }
      );
    }
  )
  .catch(
    err => {
      console.log(err);
      callback(err,null);
    }
  )
};

module.exports.quote = (event, context, callback) => {
  if(!event.params || !event.params['querystring']){
    callback(null,{'status' : { 'code' : "sitesearch/analytics/error" },'msg':'required fields empty'});
    return;
  }

  let userId = event.params['querystring']['userId'];

  account.quote(userId).then(
    data => {
      callback(null,data);
    }
  )
  .catch(
    err => {
      console.log(err);
      callback(err,null);
    }
  )
};
