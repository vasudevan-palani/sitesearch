"use strict";
var config = require('./config/config');
var axios = require('axios');
var Q = require('q');
var axiosdebug = require('axios-debug-log');
var firebase = require("firebase-admin");
var winston = require('winston');
var express = require('express');
var http = require('http');
var cors = require('cors');
var bodyParser = require('body-parser');
var session = require('express-session');
var UIDGenerator = require('uid-generator');
var aws4 = require('aws4');
var uidgen = new UIDGenerator(256, UIDGenerator.BASE62);
winston.level = "debug";

var WebHDFS = require('webhdfs');


var payments = require("./payments/payments.js");

var admin = require("firebase-admin");
var serviceAccount = require(config.firebase.ppk);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase.auth.databaseURL
});

let db = admin.database();

let app = express();
app.server = http.createServer(app);

// 3rd party middleware
app.use(cors({
  origin: config.weborigin,
  credentials: true
}));

// Session Management
let sessionConfig = {
  secret: 'keyboard cat',
  cookie: {}
};
app.use(session(sessionConfig));

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send("Welcome to SiteSearch API");
});

var updateJobStatus = function(id, status, queueName) {
  let defer = require('q').defer();

  try {

    db.ref('/' + queueName).orderByChild("oozieJobId").equalTo(id).once('value', (crawlqRef) => {
      let crawlq = crawlqRef.val();

      if (crawlq == null) {
        defer.resolve({});
        return;
      }

      let crawlKey = Object.keys(crawlq)[0];

      if (status == "SUCCEEDED" || status == "KILLED") {
        db.ref('/' + queueName + "/" + crawlKey).update({
          'status': status,
          'endTime': Date.now()
        });
      } else {
        db.ref('/' + queueName + '/' + crawlKey).update({
          'status': status
        });
      }

      if (crawlq && crawlq[crawlKey]["siteKey"]) {

        let siteKey = crawlq[crawlKey]["siteKey"];

        if (siteKey) {
          db.ref('/websites/' + siteKey).once('value', (website) => {
            let websitestatus = "PREP";

            if (status == "KILLED" || status == "SUSPENDED") {
              websitestatus = 'FAILED';
            }
            if (status == "PREP") {
              websitestatus = 'SCHEDULED';
            }
            if (status == "RUNNING") {
              websitestatus = 'STARTED';
            }
            if (status == "SUCCEEDED") {
              websitestatus = 'COMPLETED';
            }

            if(websitestatus == "COMPLETED" || websitestatus=="FAILED"){
              db.ref("/websites/" + siteKey).update({
                'status': websitestatus,
                'lastCrawlTime': Date.now()
              });

              // Move the crawls to hist
              //
              db.ref('/' + queueName + '/' + crawlKey).once('value', crawlValueRef => {
                let crawlValue = crawlValueRef.val();
                db.ref('/crawls/' + siteKey).push(crawlValue);
                db.ref('/' + queueName + '/' + crawlKey).remove();
                defer.resolve({});
              });
            }
            else {
              defer.resolve({});
            }

          });
        }
      }


    });
  } catch (err){
    defer.reject(err);
  }
  return defer.promise;
}

app.use('/api/notification', function(req, res, next) {
  // Get the website with job id and save the status
  console.log("Notification id:", req.query['id'], req.query['status']);

  let id = req.query['id'];
  let status = req.query['status'];
  let queueName = req.query['queueName'];

  updateJobStatus(id, status, queueName).then(res => {
      res.send({});
    })
    .catch(err => {
      res.status(500).send({
        error: err
      });
    });

});

app.server.listen(config.port, () => {
  console.log(`Started on port ${app.server.address().port}`);
});
