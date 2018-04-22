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

db.ref('/websites').orderByChild("status").equalTo("COMPLETED").once('value').then(
  websiteRef => {
    let websites = websiteRef.val();
    let websiteKeys = websiteRef != null ? Object.keys(websiteRef) : [];

    if (websiteKeys.length == 0) {
      admin.app().delete();
      return;
    }

    websiteKeys.forEach(websiteKey => {

        let website = websites[websiteKey];
        let timestamp = Date.now();

        let crawlId = websiteKey;

        let masterNodeName = require('os').hostname();

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
            <name>crawlId</name> \
            <value>" + crawlId + "</value> \
          </property> \
          <property> \
            <name>counter</name> \
            <value>0</value> \
          </property> \
          <property>  \
            <name>oozie.wf.application.path</name> \
            <value>" + config.oozie.apps.clean + "</value> \
          </property> \
          </configuration>", {
            headers: {
              'Content-Type': 'application/xml'
            }
          })
          .then((oozieresponse) => {
            console.log("Oozie job created : ", oozieresponse.data.id);

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
      });
  }
);
