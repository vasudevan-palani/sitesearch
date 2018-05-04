var config = require('../config/config');
var Q = require('q');

var stripe = require("stripe")(
  "sk_test_P4GXFh6a1i97ieWLSKpYsdt4"
);

function Payments(){

}

Payments.prototype.invoices = function(customerid){

  var list_defer = Q.defer();
  var invoices = {};
  stripe.invoices.list({'customer':customerid}, function(err, invoicesResponse) {
    console.log(invoicesResponse);
      if(invoicesResponse && invoicesResponse.data.length > 0){
        invoices = invoicesResponse.data.map(function(invoice){
          return {
            id : invoice.id,
            date : invoice.date,
            amount_due : invoice.amount_due,
            tax : invoice.tax,
            total : invoice.total,
            period_end : invoice.period_end,
            period_start : invoice.period_start
          }
        });
        list_defer.resolve(invoices);
      }
      else {
        list_defer.reject({code:err.statusCode,message:err.message});
      }
  });

  return list_defer.promise;
}

Payments.prototype.list = function(customerid){

  var list_defer = Q.defer();

  stripe.customers.listCards(customerid, function(err, cards) {
    console.log(cards);
      if(cards && cards.data.length > 0){
        var cards = cards.data.map(function(card){
          return {
            id : card.id,
            last4 : card.last4,
            brand : card.brand,
            exp_month : card.exp_month,
            exp_year : card.exp_year
          }
        });
        list_defer.resolve(cards);
      }
      else {
        list_defer.reject({code:err.statusCode,message:err.message});
      }
  });

  return list_defer.promise;
}

Payments.prototype.createCustomer = function(request){

  var createCustomer_defer = Q.defer();

  console.log(request);

  if(request.customerid){

    if(request.stripetoken){
      // Add the card to customer
      //
      console.log("updating the customer");
      stripe.customers.update(request.customerid, {
        source: request.stripetoken
      }, function(err, customer) {

        if(customer && customer.id){
          createCustomer_defer.resolve({customerid:request.customerid,cardid:customer.sources.data[0].id});
        }
        else {
          console.log(err);
          createCustomer_defer.reject(err);
        }
      });
    }else {
      createCustomer_defer.resolve({customerid:request.customerid});
    }


  }
  else {
    console.log("creating the customer");
    var stripe_req = {};
    if(request.email){
      stripe_req.email  = request.email;
    }
    if(request.stripetoken){
      stripe_req.source  = request.stripetoken;
    }
    stripe.customers.create(stripe_req, function(err, customer) {
      console.log(err,customer);
      if(customer && customer.id){
        createCustomer_defer.resolve({customerid:customer.id,cardid:customer.sources.data[0].id});
      }
    });
  }

  return createCustomer_defer.promise;
}


Payments.prototype.subscribe = function(request){

  var subscribe_defer = Q.defer();
  console.log("creating subscription",request);
  stripe.subscriptions.create({
    customer: request.customerid,
    source : request.stripetoken,
    plan: request.plan == 0? "basic-monthly" : "standard-monthly"
  }, function(err, subscription) {
    console.log(err,subscription);
      if(subscription && subscription.id){
        subscribe_defer.resolve(subscription);
      }
      else {
        console.log(err);
        subscribe_defer.reject(err);
      }
    }
  );

  return subscribe_defer.promise;
}

Payments.prototype.retrieveCustomer = function(customerid){

  var subscribe_defer = Q.defer();

  stripe.customers.retrieve(customerid, function(err, customer) {
      if(customer && customer.id){
        var customerdetails = {
          id : customer.id,
          email : customer.email
        }

        if(customer.sources && customer.sources.data[0]){
          customerdetails.card = {
            id : customer.sources.data[0].id,
            last4 : customer.sources.data[0].last4,
            brand : customer.sources.data[0].brand,
            exp_month : customer.sources.data[0].exp_month,
            exp_year : customer.sources.data[0].exp_year
          }
        }
        if(customer.subscriptions && customer.subscriptions.data[0]){
          customerdetails.subscription = {
            id : customer.subscriptions.data[0].id,
            end_date : customer.subscriptions.data[0].current_period_end,
            start_date : customer.subscriptions.data[0].current_period_start,
            exp_month : customer.subscriptions.data[0].exp_month,
            exp_year : customer.subscriptions.data[0].exp_year,
            plan_id : customer.subscriptions.data[0].plan.id,
            plan_name : customer.subscriptions.data[0].plan.name
          }
        }
        subscribe_defer.resolve(customerdetails);
      }
      else {
        console.log(err);
        subscribe_defer.reject(err);
      }
    }
  );

  return subscribe_defer.promise;
}

Payments.prototype.createCharge = function(customerId,charge,email){

  let defer = Q.defer();
  console.log("Creating charge ",customerId,charge);
  stripe.charges.create({
    amount: charge * 100,
    currency: 'usd',
    customer: customerId,
    receipt_email:email
  },(err,data)=>{
    if(err){
      console.log("Payment failed for customer",customerId,charge,err);
      defer.reject(err);
    }
    else {
      console.log("Payment success for customer",customerId,data);
      defer.resolve(data);
    }
  });
  return defer.promise;
}

module.exports = new Payments();
