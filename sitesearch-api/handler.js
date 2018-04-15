'use strict';
var config = require('./config/config');
var axios = require('axios');
var aws4 = require('aws4');
var payments = require("./payments/payments.js");


module.exports.welcome = (event, context, callback) => {
  const response = {
    message : "Welcome to SiteSearch API"
  };

  callback(null, response);
};

module.exports.notification = (event, context, callback) => {
  console.log(event);

  let id = event.params['querystring']['id'];
  let status = event.params['querystring']['status'];
  let token = event.params['querystring']['token']

  console.log(id,status,token);

  let websiteStatus = "FAILED";
  if(status == "KILLED"){
    websiteStatus = 'FAILED';
  }
  if(status == "PREP"){
    websiteStatus = 'SCHEDULED';
  }
  if(status == "RUNNING"){
    websiteStatus = 'STARTED';
  }
  if(status == "SUCCEEDED"){
    websiteStatus = 'COMPLETED';
  }

  axios.get(config.firebase.url+"/crawl-Q/"+id+".json?auth="+token).then(response => {
    let job = response.data;
    console.log(job);
    let websiteId = job.website.id;
    axios.get(config.firebase.url+"/websites.json?orderBy=\"id\"&equalTo=\""+websiteId+"\"&auth="+token)
    .then(resp => {
      console.log(resp.data);
      let websitekey = Object.keys(resp.data)[0];
      console.log(websitekey);
      axios.put(config.firebase.url+"/websites/"+websitekey+"/status.json?auth="+token,"\""+websiteStatus+"\"")
      .then(updateresp => {
        console.log(updateresp.data);
        callback(null,updateresp.data);
      })
      .catch(updateerr => {
        throw new Error("internalerror: Failed to update status ** : "+status+", job :"+id+", "+updateerr);
      });
    })
    .catch(websitegeterr => {
      throw new Error("internalerror: Failed to update status * : "+status+", job :"+id+", "+websitegeterr);
    });
  })
  .catch(err =>{
    throw new Error("internalerror: Failed to update status : "+status+", job :"+id+", "+err);
  });

}

module.exports.crawl = (event, context, callback) => {
  // Get the crawl id
  let siteid = event.params['querystring']['siteid'];
  let token = event.params['querystring']['token']
  console.log(siteid);

  let timestamp = Date.now();

  let crawlId = siteid + "-" + timestamp;

  axios.get(config.firebase.url+"/websites.json?orderBy=\"id\"&equalTo=\""+siteid+"\"&auth="+token)
  .then(function(val) {
      let website = val.data[Object.keys(val.data)[0]];
      console.log(website,crawlId);

      axios.put(config.hdfs + crawlId + "/urls.txt?op=CREATE&user.name=" + config.oozie.username, website.domains.join("\n"))
          .then(function(response) {
            console.log("**",response.data);
              //trigger the crawl
              //
              axios.post(config.oozie.url, "<?xml version=\"1.0\" encoding=\"UTF-8\"?> \
  <configuration> \
    <property> \
        <name>user.name</name> \
        <value>" + config.oozie.username + "</value> \
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
        <value>" + config.oozie.workflowPath + "</value> \
    </property> \
  </configuration>", {
                      headers: {
                          'Content-Type': 'application/xml'
                      }
                  })
                  .then(function(response) {
                      console.log("***",response.data);
                      axios.put(config.firebase.url+"/crawl-Q/" + response.data.id+".json?auth="+token,{
                          'id': response.data.id,
                          'status': 'PREP',
                          'website': website
                      }).then(val => {

                      });

                      axios.put(config.oozie.url + "/" + response.data.id + '?action=start', {}).then(resp => {
                              console.log("****",resp.data);
                              callback(null,{
                                  'status': {
                                      'code': 0
                                  },
                                  'id': response.data.id
                              });
                          })
                          .catch(err => {
                              console.log(err);
                              callback(null,{
                                  'status': {
                                      'code': 1,
                                      'message': 'Unable to create website.Please contact support.'
                                  }
                              });
                          })
                  })
                  .catch(function(response) {
                      console.log(response);
                      callback(null,{
                          'status': {
                              'code': 1,
                              'message': 'Unable to create website.Please contact support.'
                          }
                      });

                  });
          }).
          catch(err => {
            console.log(err);
          });

  });
}

module.exports.search = (event, context, callback) => {

  let query = event.params['querystring']['q'];
  let siteId = event.params['querystring']['siteId']
  let countOnly = event.params['querystring']['countOnly']

  let params = {
      "query" : { "match" : {"content":"*"+query+"*"} }
  }

  let awsurl = "http://"+config.aws.host;

  if(countOnly){
    awsurl = awsurl+"/"+siteId + "/_count"
  }
  else {
    awsurl = awsurl+"/"+siteId + "/_search"
  }

  let awspath = "";
  if(countOnly){
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
  axios(request,params)
  .then(function(response){
    console.log("searchrequest "+siteId);
    callback(null,{'status' : { 'code' : 0 },'results':response.data});
  })
  .catch(function(response){
    callback(null,{'status' : { 'code' : "site/search/error" },'context':response.data});
  });
}

module.exports.invoices = (event, context, callback) => {

  let customerid = event.params['querystring']['customerid'];

  payments.invoices(customerid).then(function(invoices) {

      callback(null,{'status' : { 'code' : 0 },'results':invoices});
    })
    .catch(function(error){
      callback(null,{'status' : { 'code' : -1 }});
    });

}

module.exports.cards = (event, context, callback) => {

  let customerid = event.params['querystring']['customerid'];

  payments.list(customerid).then(function(cards) {
      callback(null,{'status' : { 'code' : 0 },'results':cards});
    })
    .catch(function(error){
      callback(null,{'status' : { 'code' : -1 }});
    });

}

module.exports.charge = (event, context, callback) => {

  let request = event.request;

  payments.createCustomer(request).then(function(response) {
    req.body.customerid = response.customerid;
    if(response.cardid){
      req.body.stripetoken = response.cardid;
    }
    payments.subscribe(request).then(function(subscription){
      callback(null,{'status' : { 'code' : 0 },'results':subscription});
    })
    .catch(function(err){
      callback(null,{'status' : { 'code' : -1 }});
    });
  })
  .catch(function(error){
    callback(null,{'status' : { 'code' : -1 }});
  });

}

module.exports.customer = (event, context, callback) => {

  let customerid = event.params['querystring']['customerid'];

  payments.retrieveCustomer(customerid).then(function(customer) {
    callback(null,{'status' : { 'code' : 0 },'customer':customer});
  })
  .catch(function(error){
    callback(null,{'status' : { 'code' : -1 }});
  });

}
