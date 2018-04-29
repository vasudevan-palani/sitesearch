var firebaseHandler = require("../lib/firebase.js");
var q = require('q');
var config = require('../config/config');
var AWS = require('aws-sdk');

var standardPlanMillSeconds = config.recrawl.standardPlanMillSeconds;

var basicPlanInMillSeconds = config.recrawl.basicPlanInMillSeconds;

var retryInMillSeconds = config.recrawl.retryInMillSeconds;


module.exports.recrawlSetup = function(){
  let defer = q.defer();

  firebaseHandler.getCompletedWebsites().then(websites => {
    if(Object.keys(websites).length > 0){
      let allUpdates = [];
      Object.keys(websites).forEach(websiteKey => {
        let website = websites[websiteKey];
        console.log(website);
        if(website.lastCrawlTime == "None"){
          allUpdates.push(firebaseHandler.queueReCrawl(website));
        }
        else if (website.planId == "basic-monthly" && website.status=="COMPLETED" && website.lastCrawlTime + basicPlanInMillSeconds < Date.now()){
          allUpdates.push(firebaseHandler.queueReCrawl(website));
        }
        else if (website.planId == "standard-monthly" && website.status=="COMPLETED" && website.lastCrawlTime + standardPlanMillSeconds < Date.now()){
          allUpdates.push(firebaseHandler.queueReCrawl(website));
        }
        else if (website.planId == "basic-monthly" && website.status=="FAILED" && website.lastCrawlTime + retryInMillSeconds < Date.now()){
          allUpdates.push(firebaseHandler.queueReCrawl(website));
        }
        else if (website.planId == "standard-monthly" && website.status=="FAILED" && website.lastCrawlTime + retryInMillSeconds < Date.now()){
          allUpdates.push(firebaseHandler.queueReCrawl(website));
        }
      });
      allUpdates.allSettled(allUpdates).then(responses => {
        defer.resolve(responses);
      })
      .catch(err => {
        defer.reject(err);
      });
    }
  });

  return defer.promise;
}

module.exports.recrawl = function(){
  let defer = q.defer();
  //Check for any websites with scheduled in recrawlq
  //
  firebaseHandler.getReCrawlQ().then(queueList => {
    let emr = new AWS.EMR();

    let s3 = new AWS.S3();
    s3.getObject({
      "Bucket" : config.emr.bucketName,
      "Key" : config.emr.recrawlConfigFile
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
