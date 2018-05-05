var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://172.31.52.238:27017/";
var q = require('q');

module.exports.getPendingCount = function(siteId){
  let defer = q.defer();
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("nutch");
    var query = { "markers._gnmrk_" : {$exists : false}};
    dbo.collection(siteId+"_webpage").find(query).count(function(err, result) {
      if (err){
        defer.reject(err);
      }
      else {
        defer.resolve(result);
      }
      db.close();
    });
  });
}
