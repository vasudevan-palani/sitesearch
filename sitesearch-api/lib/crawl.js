
var firebaseHandler = require('./firebase.js');
var config = require('../config/config');
var q = require('q');

var AWS = require('aws-sdk');

var crawl = function(){
  console.log("in lib crawl");
  let defer = q.defer();

  //Check for any websites with scheduled in recrawlq
  //
  firebaseHandler.getCrawlQ().then(queueList => {
    let emr = new AWS.EMR();

    let s3 = new AWS.S3();
    s3.getObject({
      "Bucket" : config.emr.bucketName,
      "Key" : config.emr.crawlConfigFile
    },(err,data)=>{
      console.log(err,data.Body.toString());
      if(data != null && data.Body != null){
        let config = JSON.parse(data.Body.toString());
        emr.runJobFlow(config, (err,data)=>{
          if(err != null){
            console.log("JobFlow creation failed ", err)
            defer.reject(err);
          }
          else {
            console.log("JobFlow created with id",data);
            defer.resolve(data);
          }
        });
      }
    });
  });

  return defer.promise;
}

module.exports.crawl = crawl;
