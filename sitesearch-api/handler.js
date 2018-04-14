'use strict';
var config = require('./config/config');
var axios = require('axios');

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
  console.log(event,context);

  // let id = event.queryParams['id'];
  // let status = event.queryParams['status'];
  //
  // let token = event['token']

  callback(null,{});
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

  callback(null,{});
}

module.exports.invoices = (event, context, callback) => {
  console.log(event,context);

  // let id = event.queryParams['id'];
  // let status = event.queryParams['status'];
  //
  // let token = event['token']

  callback(null,{});
}

module.exports.cards = (event, context, callback) => {
  console.log(event,context);

  // let id = event.queryParams['id'];
  // let status = event.queryParams['status'];
  //
  // let token = event['token']

  callback(null,{});
}

module.exports.charge = (event, context, callback) => {
  console.log(event,context);

  // let id = event.queryParams['id'];
  // let status = event.queryParams['status'];
  //
  // let token = event['token']

  callback(null,{});
}

module.exports.customer = (event, context, callback) => {
  console.log(event,context);

  // let id = event.queryParams['id'];
  // let status = event.queryParams['status'];
  //
  // let token = event['token']

  callback(null,{});
}
