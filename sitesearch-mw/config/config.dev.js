module.exports = {
  hdfs : 'http://localhost:50070/webhdfs/v1/user/vpalan799/',
  aws : {
    'region' : 'us-east-1',
    'service' : 'es',
    'host' : 'search-sitesearch-dev-ysygv3etypruskqtfow55cgfiy.us-east-1.es.amazonaws.com'
  },
  oozie : {
    url : 'http://localhost:11000/oozie/v1/jobs',
    username : 'vpalan799',
    notificationUrl : 'http://localhost:8085/api/notification?id=$jobId&amp;status=$status',
    workflowPath : 'hdfs://localhost:9000/user/vpalan799/workflows/crawl-dev'
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
  	ppk : '/Users/vpalan799/Downloads/opensearch-2a0db-firebase-adminsdk-c87oh-80d58a586e.json',
    admin : {
      username : 'opensearch.svolve@gmail.com',
      password : 'password'
    }
  },
  weborigin : 'http://localhost:4200'
};
