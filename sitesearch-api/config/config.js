module.exports = {
  hdfs : 'http://hadoop-master:50070/webhdfs/v1/user/vpalan799/',
  aws : {
    'region' : 'us-east-1',
    'service' : 'es',
    'host' : 'search-sitesearch-dev-ysygv3etypruskqtfow55cgfiy.us-east-1.es.amazonaws.com'
  },
  oozie : {
    url : 'http://hadoop-master:11000/oozie/v1/jobs',
    username : 'ubuntu',
    notificationUrl : 'http://hadoop-master:8085/api/notification?id=$jobId&amp;status=$status',
    workflowPath : 'hdfs://hadoop-master:9000/user/vpalan799/workflows/crawl'
  },
  firebase : {
  	url : 'https://opensearch-2a0db.firebaseio.com'
  },
  weborigin : 'http://sitesearch.svolve.com:4200'
};
