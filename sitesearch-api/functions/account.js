
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
