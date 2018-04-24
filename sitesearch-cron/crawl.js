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

let MAX_CRAWL = 2;


db.ref('/crawlq').orderByChild("status").equalTo("SCHEDULED").once('value').then(
  (value) => {
    let crawlJobs = value.val();
    let jobIds = crawlJobs != null ? Object.keys(crawlJobs) : [];

    if (jobIds.length == 0) {
      admin.app().delete();
      return;
    }

    jobIds = jobIds.slice(0,jobIds.length>MAX_CRAWL?MAX_CRAWL:jobIds.length);

    jobIds.forEach(jobId => {
      let job = crawlJobs[jobId];
      console.log(job.siteKey);
      db.ref('/websites/' + job.siteKey).once('value').then(
        websiteRef => {

          let website = websiteRef.val();

          let timestamp = Date.now();

          let crawlId = job.siteKey;

          let masterNodeName = require('os').hostname();


          axios.put(config.hdfs + crawlId + "-crawl/urls.txt?op=CREATE&overwrite=true&user.name=" + config.oozie.username, job.urls.join("\n"))
            .then((hdfsresponse) => {

              //trigger the crawl
              //
              axios.post(config.oozie.url + "/jobs", "<?xml version=\"1.0\" encoding=\"UTF-8\"?> \
                <configuration> \
                <property> \
                  <name>user.name</name> \
                  <value>" + config.oozie.username + "</value> \
                </property> \
                <property>  \
                  <name>masterNode</name> \
                  <value>" + masterNodeName + "</value> \
                </property> \
                <property>  \
                  <name>seedDir</name> \
                  <value>" + crawlId + "-crawl</value> \
                </property> \
                <property>  \
                  <name>crawlId</name> \
                  <value>" + crawlId + "</value> \
                </property> \
                <property> \
                  <name>counter</name> \
                  <value>0</value> \
                </property> \
                <property> \
                  <name>oozie.wf.workflow.notification.url</name> \
                  <value>" + config.oozie.notificationUrl + "</value> \
                </property> \
                <property>  \
                  <name>oozie.wf.application.path</name> \
                  <value>" + config.oozie.apps.crawl + "</value> \
                </property> \
                </configuration>", {
                  headers: {
                    'Content-Type': 'application/xml'
                  }
                })
                .then((oozieresponse) => {
                  console.log("Oozie job created : ", oozieresponse.data.id);
                  db.ref('/crawlq/' + jobId).update({
                    'oozieJobId': oozieresponse.data.id,
                    'status': 'PREP',
                    'startTime': Date.now()
                  });
                  axios.put(config.oozie.url + "/job/" + oozieresponse.data.id + '?action=start', {}).then(ooziestartresp => {
                      console.log("Oozie job started : ", oozieresponse.data.id);
                      admin.app().delete();
                    })
                    .catch(ooziestarterr => {
                      console.log("Oozie job failed : ", ooziestarterr);
                      admin.app().delete();
                    });
                })
                .catch((ooziecreateerr) => {
                  console.log("Oozie job creation failed : ", ooziecreateerr.data);
                  admin.app().delete();
                });

            }).catch(hadooperr => {
              console.log(hadooperr);
            });;

        }
      );
    });
  }
);
