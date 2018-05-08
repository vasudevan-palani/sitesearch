var firebaseHandler = require("../lib/firebase.js");
var q = require('q');
var AWS = require('aws-sdk');

var recrawlInterval = parseInt(process.env.recrawlInterval);


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
        else if (website.lastCrawlTime + recrawlInterval < Date.now()){
          allUpdates.push(firebaseHandler.queueReCrawl(website));
        }
      });
      q.allSettled(allUpdates).then(responses => {
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
      "Bucket" : process.env.s3BucketName,
      "Key" : process.env.recrawlConfigFile
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
                group.AutoScalingPolicy.Constraints.MaxCapacity = queueList.length + 1;
                console.log("group config",group);
              }
            });

            config.Instances.InstanceGroups = instanceGroups;
            console.log("instance group config",instanceGroups);
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
