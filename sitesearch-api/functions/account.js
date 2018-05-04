
var account = require("../lib/account.js")

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
