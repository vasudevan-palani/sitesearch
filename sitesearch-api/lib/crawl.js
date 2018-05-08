
var firebaseHandler = require('./firebase.js');
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
      "Bucket" : process.env.s3BucketName,
      "Key" : process.env.crawlConfigFile
    },(err,data)=>{
      console.log(err,data.Body.toString());

      if(data != null && data.Body != null){
        let config = JSON.parse(data.Body.toString());

        if(config && config.Instances && config.Instances.InstanceGroups &&
          config.Instances.InstanceGroups.length > 0 && queueList.length > 3){
            console.log("queueList > 3");
            let instanceGroups = config.Instances.InstanceGroups;
            instanceGroups.forEach(group => {
              if(group.InstanceRole == "CORE"){
                group.InstanceCount = queueList.length/2;
                group.AutoScalingPolicy.Constraints.MaxCapacity = queueList.length+1;
                console.log("group config",group);
              }
            });

            console.log("instance group config",instanceGroups);
            config.Instances.InstanceGroups = instanceGroups;
          }

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


var pcrawl = function(){
  console.log("in lib crawl");
  let defer = q.defer();

  //Check for any websites with scheduled in recrawlq
  //
  firebaseHandler.getPCrawlQ().then(queueList => {
    let emr = new AWS.EMR();

    let s3 = new AWS.S3();
    s3.getObject({
      "Bucket" : process.env.s3BucketName,
      "Key" : process.env.pcrawlConfigFile
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
module.exports.pcrawl = pcrawl;
