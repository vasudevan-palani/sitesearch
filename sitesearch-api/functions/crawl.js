
var crawl = require("../lib/crawl.js");

module.exports.crawl = (event, context, callback) => {
  console.log("in crawl");
  crawl.crawl().then(
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


module.exports.pcrawl = (event, context, callback) => {
  console.log("in pcrawl");
  crawl.pcrawl().then(
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
