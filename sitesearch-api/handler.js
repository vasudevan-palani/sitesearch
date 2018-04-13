'use strict';
var config = require('./config/config');

module.exports.welcome = (event, context, callback) => {
  const response = {
    message : "Welcome to SiteSearch API"
  };

  callback(null, response);
};

module.exports.notification = (event, context, callback) => {
  console.log(event,context);

  // let id = event.queryParams['id'];
  // let status = event.queryParams['status'];
  //
  // let token = event['token']

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
