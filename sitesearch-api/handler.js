'use strict';

var website = require("./functions/website.js");
var analytics = require("./functions/analytics.js");
var stripe = require("./functions/stripe.js");
var crawl = require("./functions/crawl.js");
var recrawl = require("./functions/recrawl.js");

var account = require("./functions/account.js");

module.exports.welcome = (event, context, callback) => {
  const response = {
    message : "Welcome to SiteSearch API"
  };
  callback(null, response);
};


module.exports.invoices = stripe.invoices;
module.exports.cards = stripe.cards;
module.exports.charge = stripe.charge;
module.exports.customer = stripe.customer;
module.exports.webhook = stripe.webhook;

module.exports.crawl = crawl.crawl;
module.exports.recrawlSetup = recrawl.recrawlSetup;
module.exports.recrawl = recrawl.recrawl;

module.exports.pages = website.pages;
module.exports.search = website.search;
module.exports.count = website.count;
module.exports.analytics = analytics.analytics;
module.exports.trialValidator = account.validateTrialAccounts;
module.exports.suspendValidator = account.validateSuspendedAccounts;

module.exports.config = website.config;
module.exports.quote = account.quote;
module.exports.billing = stripe.billing;
