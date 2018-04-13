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

db = admin.database();

let app = express();
app.server = http.createServer(app);

// 3rd party middleware
app.use(cors({origin:config.weborigin,credentials:true}));

// Session Management
sessionConfig = {
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

  db.ref('/crawl-Q/'+id).once('value',function(value){
    let val =value.val();
    db.ref('/crawl-Q/'+id).update({'status':status});
    if(val && val["website"]){
      let siteId = val.website ? val.website.id : undefined;

      if(siteId){
        db.ref('/websites').orderByChild("id").equalTo(siteId).once('value',function(websiteList){
            websiteList.forEach(function(website) {

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
              db.ref("/websites/"+website.key).update({'status':websitestatus});
            });
        });
      }
    }


  });
  res.send({});
});

app.use('/api/site',function(req,res,next){
  //Get the token and validate it
  //
  // Request body should have
  //
  //  request {
  //    token : <firebsae token>
  //  }
  var idToken = req.body.token;
  admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
      var uid = decodedToken.uid;
      req.session.uid = uid;
      next();
    }).catch(function(error) {
      res.status(403);
      res.send({'status' : { 'code' : 1 }});
    });

});

app.use('/api/payments',function(req,res,next){
  //Get the token and validate it
  //
  // Request body should have
  //
  //  request {
  //    token : <firebsae token>
  //  }
  var idToken = req.body.token || req.query.token;
  console.log(idToken);
  if(!idToken){
    res.status(403);
    res.send({'status' : { 'code' : 1 }});
  }
  else {
    admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        var uid = decodedToken.uid;
        req.session.uid = uid;
        next();
      }).catch(function(error) {
        console.log("verification failed");
        res.status(403);
        res.send({'status' : { 'code' : 1 }});
      });
  }

});

app.post('/api/site/crawl',function(req,res){

  // Get the crawl id
  let siteid = req.query.siteid;
  console.log(siteid);

  let  timestamp = Date.now();

  let crawlId = siteid+"-"+timestamp;

  db.ref("/websites/").orderByChild("id").equalTo(siteid).once('value',function(val){
    let website = val.val()[Object.keys(val.val())[0]];
    console.log(website);

    axios.put(config.hdfs + crawlId+"/urls.txt?op=CREATE&user.name="+config.oozie.username, website.domains.join("\n"))
    .then(function(response) {
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
      .then(function(response) {
        console.log(response);
        db.ref('/crawl-Q/'+response.data.id).update({'id':response.data.id,'status':'PREP','website':website});
        axios.put(config.oozie.url+"/"+response.data.id+'?action=start',{}).then(resp =>{
          console.log(resp);
          res.send({'status' : { 'code' : 0 }, 'id':response.data.id});
        })
        .catch( err => {
          console.log(err);
          res.send({'status' : { 'code' : 1 ,'message': 'Unable to create website.Please contact support.'}});
        })
      })
      .catch(function(response) {
       console.log(response);
        res.send({'status' : { 'code' : 1 ,'message': 'Unable to create website.Please contact support.'}});
      });
  });

  });
});

/**
  This API will return the search results
  The inputs required in GET are
  token : token which uniquely identifies the token
  q : search parameters URL encoded
  site : you are searching
  countOnly : if this is 'true', we give only the count
*/
app.get('/api/search',function(req,res){
  let params = {
      query : { "match" : {"content":"*"+req.query.q+"*"} }
  }

  let awsurl = "http://"+config.aws.host;
  let siteId = req.query['siteid']
  if(req.query['countOnly']){
    awsurl = awsurl+"/"+siteId + "/_count"
  }
  else {
    awsurl = awsurl+"/"+siteId + "/_search"
  }

  let awspath = "";
  if(req.query['countOnly']){
    awspath = "/"+siteId + "/_count"
  }
  else {
    awspath = "/"+siteId + "/_search"
  }

  let request = {
    host: config.aws.host,
    method: 'GET',
    url: awsurl,
    path: awspath,
    service: config.aws.service, region: config.aws.region
  }

  let signedRequest = aws4.sign(request,
  {
      // assumes user has authenticated and we have called
      // AWS.config.credentials.get to retrieve keys and
      // session tokens
      secretAccessKey: process.env["SECRET_ACCESS_KEY"],
      accessKeyId: process.env["ACCESS_KEY_ID"]
  });
  console.log(request);
  axios(request,params)
  .then(function(response){
    console.log(response.data);
    res.send({'status' : { 'code' : 0 },'results':response.data});
  })
  .catch(function(response){
    console.log(response);
    res.send({'status' : { 'code' : "site/search/error" },'context':response.data});
  });
});

/**
  This API will return the list of invoices for a customer id
  The inputs required in GET are
  customerid : customer id from stripe
*/
app.get('/api/payments/invoices',function(req,res){

  payments.invoices(req.query.customerid).then(function(invoices) {
      res.send({'status' : { 'code' : 0 },'results':invoices});
    })
    .catch(function(error){
      res.send({'status' : { 'code' : -1 }});
    });
});

/**
  This API will return the list of cards for a customer id
  The inputs required in GET are
  customerid : customer id from stripe
*/
app.get('/api/payments/list',function(req,res){
  payments.list(req.query.customerid).then(function(cards) {
      res.send({'status' : { 'code' : 0 },'results':cards});
    })
    .catch(function(error){
      res.send({'status' : { 'code' : -1 }});
    });
});

/**
  This API will add the subscribe the customer to plan
  customerid : customer id from stripe ( optional )
  email : mandatory
  token : token source created by stripe
  plan : plan for subscription ( 0 for basic, 1 for standard)
  currency : by default is "usd"
*/
app.post('/api/payments/charge',function(req,res){

  payments.createCustomer(req.body).then(function(response) {
    req.body.customerid = response.customerid;
    if(response.cardid){
      req.body.stripetoken = response.cardid;
    }
    payments.subscribe(req.body).then(function(subscription){
      res.send({'status' : { 'code' : 0 },'results':subscription});
    })
    .catch(function(err){
      res.send({'status' : { 'code' : -1 }});
    });
  })
  .catch(function(error){
    res.send({'status' : { 'code' : -1 }});
  });

});


/**
  This API will add the subscribe the customer to plan
  customerid : customer id from stripe ( optional )
  email : mandatory
  token : token source created by stripe
  plan : plan for subscription ( 0 for basic, 1 for standard)
  currency : by default is "usd"
*/
app.post('/api/payments/details',function(req,res){

  payments.retrieveCustomer(req.body.customerid).then(function(customer) {
      res.send({'status' : { 'code' : 0 },'customer':customer});
  })
  .catch(function(error){
    res.send({'status' : { 'code' : -1 }});
  });

});

app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
});
