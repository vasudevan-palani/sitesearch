'use strict';
var config = require('./config/config');
var axios = require('axios');
var aws4 = require('aws4');
var admin = require("firebase-admin");
var serviceAccount = require(config.firebase.ppk);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase.auth.databaseURL
});

let db = admin.database();

db.ref('/crawlq').orderByChild("status").equalTo("SCHEDULED").once('value',(value)=>{
    let crawlJobs = value.val();
    let jobIds = Object.keys(crawlJobs);

  jobIds.forEach(jobId => {
    let job = crawlJobs[jobId];

    db.ref('/websites/'+job.siteKey).once('value',website => {

      let timestamp = Date.now();

      let crawlId = job.siteKey+"-"+timestamp;

      axios.put(config.hdfs + crawlId+"/urls.txt?op=CREATE&user.name="+config.oozie.username, website.domains.join("\n"))
      .then((hdfsresponse)=> {
          //trigger the crawl
          //
          axios.post(config.oozie.url, "<?xml version=\"1.0\" encoding=\"UTF-8\"?> \
              <configuration> \
              <property> \
                <name>user.name</name> \
                <value>"+config.oozie.username+"</value> \
              </property> \
              <property>  \
                <name>crawlId</name> \
                <value>"+crawlId+"</value> \
              </property> \
              <property> \
                <name>counter</name> \
                <value>0</value> \
              </property> \
              <property> \
                <name>oozie.wf.workflow.notification.url</name> \
                <value>"+config.oozie.notificationUrl+"</value> \
              </property> \
              <property>  \
                <name>oozie.wf.application.path</name> \
                <value>"+config.oozie.workflowPath+"</value> \
              </property> \
              </configuration>",
              {
                headers : {
                  'Content-Type' : 'application/xml'
                }
          })
          .then((oozieresponse)=> {
              console.log("Oozie job created : ",oozieresponse.data.id);
              db.ref('/crawlq/'+jobId).update({'oozieJobId':oozieresponse.data.id,'status':'PREP'});
              axios.put(config.oozie.url+"/"+oozieresponse.data.id+'?action=start',{}).then(resp =>{
                console.log("Oozie job started : ",response.data.id);
              })
              .catch( ooziestarterr => {
                console.log("Oozie job failed : ",ooziestarterr.data);
              });
          })
          .catch((ooziecreateerr)=> {
              console.log("Oozie job creation failed : ",ooziecreateerr.data);
          });
    });

  });
});
