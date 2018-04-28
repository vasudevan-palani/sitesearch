var config = require('../config/config');
var Q = require('q');

var AWS = require('aws-sdk');
var cloudwatch = new AWS.CloudWatch();

module.exports.sendMetricData=function(siteId){
  var params = {
	"MetricData": [{
		"MetricName": "searchRequests",
		"Dimensions": [{
			"Name": "website",
			"Value": siteId
		}],
		"Value": 1
	}],
	"Namespace": "sitesearch"
};
    cloudwatch.putMetricData(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
}
