. ./env.sh

CURRENT_PATH=`pwd`

#mysql
${MYSQL_HOME}/bin/mysqld --basedir ${MYSQL_HOME} --initialize
${MYSQL_HOME}/bin/mysql oozie < ./mysql-first-time.sql
#Hadoop

bin/hdfs namenode -format
sbin/start-all.sh
bin/hdfs dfs -mkdir /user
bin/hdfs dfs -mkdir /user/${USERNAME}
bin/hdfs dfs -mkdir /user/${USERNAME}/workflows
bin/hdfs dfs -mkdir /user/${USERNAME}/workflows/crawl
bin/hdfs dfs -put ${SITESEARCH_INSTALL_PATH}/workflows/* /user/${USERNAME}/workflows/crawl

sbin/mr-jobhistory-daemon.sh --config ./etc/hadoop/ start historyserver


#mongo
${MONGODB_HOME}/bin/mongod -dbpath ${MONGODB_DATA_PATH}

#Oozie
${SITESEARCH_INSTALL_PATH}/oozie/bin/oozied.sh start
