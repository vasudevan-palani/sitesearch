module.exports = {
  hdfs : 'http://34.238.49.244:50070/webhdfs/v1/user/ubuntu',
  aws : {
    'region' : 'us-east-1',
    'service' : 'es',
    'host' : 'search-sitesearch-dev-ysygv3etypruskqtfow55cgfiy.us-east-1.es.amazonaws.com'
  },
  oozie : {
    url : 'http://34.238.49.244:11000/oozie/v1/jobs',
    username : 'ubuntu',
    notificationUrl : 'https://api.sitesearch.svolve.com/notification?id=$jobId&amp;status=$status',
    workflowPath : 'hdfs://34.238.49.244:9000/user/vpalan799/workflows/crawl'
  },
  firebase : {
  	url : 'https://opensearch-2a0db.firebaseio.com'
  },
  emr : {
    bucketName : 'sitesearch-emr-archives',
    crawlConfigFile : 'sitesearch-conf/emr-config-crawl-sdk.json',
    recrawlConfigFile : 'sitesearch-conf/emr-config-recrawl-sdk.json'
  },
  recrawl: {
    basicPlanInMillSeconds:302400000,
    standardPlanMillSeconds:604800000,
    retryInMillSeconds:21600000
  },
  weborigin : 'http://sitesearch.svolve.com:4200'
};
