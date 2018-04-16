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
app.use(cors({origin:config.weborigin,credentials:true}));

// Session Management
let sessionConfig = {
  secret: 'keyboard cat',
  cookie: {}
};
app.use(session(sessionConfig));

app.use(bodyParser.json());

app.get('/',function(req,res){
  res.send("Welcome to SiteSearch API");
});

app.use('/api/notification',function(req,res,next){
  // Get the website with job id and save the status
  console.log("Notification id:",req.query['id'],req.query['status']);

  let id = req.query['id'];
  let status = req.query['status'];

  db.ref('/crawlq').orderByChild("oozieJobId").equalTo(id).once('value',(crawlqRef)=>{
    let crawlq =crawlqRef.val();

    crawlqRef.update({'status':status});

    if(crawlq && crawlq["siteKey"]){

      let siteKey = crawlq.siteKey;

      if(siteKey){
        db.ref('/websites/'+siteKey).once('value',(website)=>{
	         let websitestatus="PREP";

            if(status == "KILLED"){
              websitestatus = 'FAILED';
            }
            if(status == "PREP"){
              websitestatus = 'SCHEDULED';
            }
            if(status == "RUNNING"){
              websitestatus = 'STARTED';
            }
            if(status == "SUCCEEDED"){
              websitestatus = 'COMPLETED';
            }
            db.ref("/websites/"+siteKey).update({'status':websitestatus});
        });
      }
    }


  });
  res.send({});
});

app.server.listen(config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
});
