
var email = require("../lib/email.js");

module.exports.sendMessage = (event, context, callback) => {

  if(!event.request || !event.request['message'] || !event.request['email'] || !event.request['name']){
    callback(null,{'status' : { 'code' : "sitesearch/sendMessage/error" },'msg':'required fields empty'});
    return;
  }

  console.log("in sendMessage");

  let text = "Message sent by "+ event.request['name'] + "("+event.request['email']+") - " + event.request['message'];

  email.sendMail("sitesearch.svolve@gmail.com",text,"Message from - "+event.request['name']).then(
    data => {
      console.log(data);
      callback(null,data);
    }
  ).catch(
    err => {
      console.log(err);
      callback(err,null);
    }
  );
}
