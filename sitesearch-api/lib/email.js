var email = require("../lib/email.js");
var AWS = require('aws-sdk');
var q = require('q');

var sendMail=function(toEmail,body,subject){

  let defer =  q.defer();

  var params = {
    Destination: {
     ToAddresses: [
        toEmail
     ]
    },
    Message: {
     Body: {
      Text: {
       Charset: "UTF-8",
       Data: body
      }
     },
     Subject: {
      Charset: "UTF-8",
      Data: subject
     }
   },
    Source: "Support - svolve <support@svolve.com>",
 };
 let ses = new AWS.SES();
 ses.sendEmail(params, function(err, data) {
   if (err){
     defer.reject(err);
     console.log(err, err.stack);
   }
   else {
     defer.resolve(data);
     console.log(data);
   }
 });

 return defer.promise;
}

var sendMailByTemplate=function(toEmail,templateName,subject){

  let defer =  q.defer();

  let templates = {
    'paymentFailed' : `Dear customer,
        Your account is currently suspended. The credit card transaction for payment was declined. Kindly email support@svolve.com with your valid credit card details to continue the service.
    Thanks.
    Svolve Team`,
    'TrailExpired' : `Dear customer,
        Your account is currently suspended. Your trial period has expired. Kindly email support@svolve.com with your valid credit card details to continue the service.
    Thanks.
    Svolve Team`
  }

  let emailTemplate = templates[templateName];

  if(emailTemplate == undefined){
    defer.reject('Invalid template');
    return;
  }

  var params = {
    Destination: {
     ToAddresses: [
        toEmail
     ]
    },
    Message: {
     Body: {
      Html: {
       Charset: "UTF-8",
       Data: emailTemplate
      }
     },
     Subject: {
      Charset: "UTF-8",
      Data: subject
     }
   },
   Source: "Support - svolve <support@svolve.com>",
 };
 let ses = new AWS.SES();
 ses.sendEmail(params, function(err, data) {
   if (err){
     defer.reject(err);
     console.log(err, err.stack);
   }
   else {
     defer.resolve(data);
     console.log(data);
   }
 });

 return defer.promise;
}

module.exports ={
  sendMail : sendMail,
  sendMailByTemplate : sendMailByTemplate
}
