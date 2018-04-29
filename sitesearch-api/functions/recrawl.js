
var recrawl = require("../lib/recrawl.js")

module.exports.recrawlSetup = (event, context, callback) => {
  recrawl.recrawlSetup().then(
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

module.exports.recrawl = (event, context, callback) => {
  recrawl.recrawl().then(
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
