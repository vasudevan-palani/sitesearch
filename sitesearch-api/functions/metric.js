var config = require('../config/config');
var q = require('q');

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

module.exports.sendMetricData=function(siteId){
  let curDate = new Date();
  let dateString = curDate.getUTCFullYear()+"-"+(curDate.getUTCMonth()+1)+"-"+curDate.getUTCDate();
  let params = {
    Key : {
      websiteid : {
        S: siteId
      },
      timestamp : {
        S: dateString
      }
    },
    TableName: process.env.MetricsTable,
    AttributeUpdates: {
      'count' : {
        Action : 'ADD',
        Value : {
          N : '1'
        }
      }
    }
  };
    dynamodb.updateItem(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
}

module.exports.getMetricData = function(siteId){
  let defer = q.defer();
  let curDate = new Date();
  let dateString = curDate.getUTCFullYear()+"-"+(curDate.getUTCMonth()+1);
  let params = {
    ScanFilter:{
      'timestamp' : {
        ComparisonOperator:"BEGINS_WITH",
        AttributeValueList:[
          {S:dateString}
        ]
      },
      'websiteid':{
        ComparisonOperator:"EQ",
        AttributeValueList:[
          {S:siteId}
        ]
      }
    },
    TableName: process.env.MetricsTable
  };
  console.log(params);
    dynamodb.scan(params, function(err, data) {
      let items = {};
      let total = 0;
      if (err)
      {
        console.log(err, err.stack); // an error occurred
        defer.reject(err);
      }
      else {
        if(data['Items'] && data['Items'].length > 0){
          data['Items'].forEach(item => {
              items[item.timestamp['S']]=item.count['N'];
              total = total + parseInt(item.count['N']);
          });
          defer.resolve({'total':total,'items':items});
        }
        console.log(data);           // successful response
      }
    });

    return defer.promise;
}
