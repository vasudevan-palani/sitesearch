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
  console.log(event,context);

  let id = event.params['query']['id'];
  let status = event.params['query']['status'];
  let token = event['query']['token']

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

  axios.get(config.firebase.url+"/crawl-Q/"+id+".json?auth="+token).then(job => {
    let websiteId = job.website.id;
    axios.put(config.firebase.url+"/websites/"+websiteId+".json?auth="+token,{
      'status' : websiteStatus
    }).
    catch(err => {
      throw new Error("internalerror: Failed to update status : "+status+", job :"+id);
    });
  })
  .catch(err =>{
    throw new Error("internalerror: Failed to update status : "+status+", job :"+id);
  });

  callback(null,{});
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
  console.log(event,context);

  // let id = event.queryParams['id'];
  // let status = event.queryParams['status'];
  //
  // let token = event['token']

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
