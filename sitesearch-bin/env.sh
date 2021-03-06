HADOOP_MASTER=hadoop-master
SITESEARCH_INSTALL_PATH=/home/ubuntu/sitesearch/build
HADOOP_HOME=${SITESEARCH_INSTALL_PATH}/hadoop

MYSQL_HOME=
MYSQL_PORT=3306
USERNAME=ubuntu

MONGO_PORT=27017

#Hadoop
#
HADOOP_NAME_SERVER=${HADOOP_MASTER}
HADOOP_NAME_SERVER_PORT=9000

#Oozie
#
OOZIE_DB_HOST=${HADOOP_MASTER}
OOZIE_DB_PORT=${MYSQL_PORT}

#NUTCH
#
NUTCH_DB_HOST=${HADOOP_MASTER}
NUTCH_DB_PORT=${MONGO_PORT}

PLUGIN_FOLDERS=/home/ubuntu/sitesearch/build/workflows/plugins
JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64

DATANODE_DIR=/home/ubuntu/datanode
NAMENODE_DIR=/home/ubuntu/namenode
