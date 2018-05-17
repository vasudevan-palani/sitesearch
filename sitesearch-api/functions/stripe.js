var metricHandler = require('../lib/metric.js');
var axios = require('axios');
var aws4 = require('aws4');
var AWS = require('aws-sdk');
var q = require('q');
var payments = require("../lib/payments.js");
var firebase = require("../lib/firebase.js");
var account = require("../lib/account.js");

var webhook = (event, context, callback) => {
  console.log(event);
}

var invoices = (event, context, callback) => {

  if (!event.params || !event.params['querystring']) {
    callback(null, {
      'status': {
        'code': "sitesearch/invoices/error"
      },
      'msg': 'required fields empty'
    });
    return;
  }

  let customerid = event.params['querystring']['customerid'];

  payments.charges(customerid).then(function(charges) {

      callback(null, {
        'status': {
          'code': 0
        },
        'results': charges
      });
    })
    .catch(function(error) {
      callback(null, {
        'status': {
          'code': -1
        }
      });
    });

}

var cards = (event, context, callback) => {

  if (!event.params || !event.params['querystring']) {
    callback(null, {
      'status': {
        'code': "sitesearch/cards/error"
      },
      'msg': 'required fields empty'
    });
    return;
  }

  let customerid = event.params['querystring']['customerid'];

  payments.list(customerid).then(function(cards) {
      callback(null, {
        'status': {
          'code': 0
        },
        'results': cards
      });
    })
    .catch(function(error) {
      callback(null, {
        'status': {
          'code': -1
        }
      });
    });

}


var charge = (event, context, callback) => {

  let request = event.request;

  console.log(event);

  if(request.userId == undefined){
    callback(null, {
      'status': {
        'code': 0
      },
      'results': {}
    });
    return;
  }

  payments.createCustomer(request).then((response) => {
      console.log("created customer successfully", response);
      firebase.activateAccount(request.userId,response.customerid).then(resp => {
        callback(null, {
          'status': {
            'code': 0
          },
          'results': response
        });
      })
      .catch(err => {
        callback(null, {
          'status': {
            'code': -1
          }
        });
      });

    })
    .catch((error) => {
      console.log(error);
      callback(null, {
        'status': {
          'code': -1
        }
      });
    });

}

var customer = (event, context, callback) => {
  if (!event.params || !event.params['querystring']) {
    callback(null, {
      'status': {
        'code': "sitesearch/customer/error"
      },
      'msg': 'required fields empty'
    });
    return;
  }

  let customerid = event.params['querystring']['customerid'];

  payments.retrieveCustomer(customerid).then(function(customer) {
      callback(null, {
        'status': {
          'code': 0
        },
        'customer': customer
      });
    })
    .catch(function(error) {
      callback(null, {
        'status': {
          'code': -1
        }
      });
    });

}


var billing = (event, context, callback) => {

  firebase.getActiveCustomers().then(customers => {
    Object.keys(customers).forEach(customerKey => {
      console.log("getting quote for customer ", customerKey);

      if (customers[customerKey].nextChargeDate < Date.now()) {
        account.quote(customerKey).then(quote => {
          console.log(" quote for customer ", customerKey, quote);
          payments.createCharge(customers[customerKey].customerId, quote.charge,customers[customerKey].email).then(resp => {
            firebase.updateAccountNextChargeDate(customerKey).catch(err => {
              console.log("Customer payment success, but updating nextChargeDate failed", err,customerKey,customers[customerKey],quote);
            });
          }).catch(paymentFailure => {
            //Suspend the account
            //
            firebase.updateAccountStatus(customerKey, 'SUSPENDED').then((data) => {
              console.log("Customer suspened as payment failed", data, customerKey, quote,paymentFailure);
            });
          })
        });
      }

    });
  });

}


module.exports = {
  billing: billing,
  customer: customer,
  charge: charge,
  cards: cards,
  invoices: invoices,
  webhook: webhook
}
