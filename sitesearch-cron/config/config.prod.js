module.exports = {
  hdfs : 'http://hadoop-master:50070/webhdfs/v1/user/hadoop/',
  aws : {
    'region' : 'us-east-1',
    'service' : 'es',
    'host' : 'search-sitesearch-prod-ef5brjrpuzcqee3jbd3wbzgqbe.us-east-1.es.amazonaws.com'
  },
  oozie : {
    url : 'http://hadoop-master:11000/oozie/v1',
    username : 'hadoop',
    notificationUrl : 'http://ip-172-31-52-238:8085/api/notification?id=$jobId&amp;status=$status',
    apps : {
      clean : 'hdfs://hadoop-master:8020/user/hadoop/oozieapps/crawl/clean.xml',
      crawl : 'hdfs://hadoop-master:8020/user/hadoop/oozieapps/crawl',
      recrawl : 'hdfs://hadoop-master:8020/user/hadoop/oozieapps/crawl/recrawl.xml',
      pcrawl : 'hdfs://hadoop-master:8020/user/hadoop/oozieapps/crawl/pcrawl.xml'
    }
  },
  firebase : {
  	auth : {
      apiKey: "AIzaSyA0e92EeW45AQ41mudAI26aup0coCWWUVU",
      authDomain: "sitesearch-prod.firebaseapp.com",
      databaseURL: "https://sitesearch-prod.firebaseio.com",
      projectId: "sitesearch-prod",
      storageBucket: "sitesearch-prod.appspot.com",
      messagingSenderId: "244222106126"
  	},
  	ppk : '/home/hadoop/sitesearch-prod-firebase-adminsdk-u5ygp-f6bf1bc9f5.json',
    admin : {
      username : 'sitesearch.svolve@gmail.com',
      password : 'Gmail@2013'
    }
  },
  weborigin : 'http://sitesearch.svolve.com:4200'
};
