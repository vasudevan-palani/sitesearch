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
  	auth : {
      apiKey: "AIzaSyALwIRzd8-0tACUGay3xa0gaT6dXoED8yQ",
      authDomain: "opensearch-2a0db.firebaseapp.com",
      databaseURL: "https://opensearch-2a0db.firebaseio.com",
      projectId: "opensearch-2a0db",
      storageBucket: "opensearch-2a0db.appspot.com",
      messagingSenderId: "710024249927"
  	},
  	ppk : '/home/ubuntu/opensearch-2a0db-firebase-adminsdk-c87oh-80d58a586e.json',
    admin : {
      username : 'opensearch.svolve@gmail.com',
      password : 'password'
    }
  },
  weborigin : 'http://sitesearch.svolve.com:4200'
};
