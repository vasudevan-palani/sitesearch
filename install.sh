#!/bin/ksh

if [ "$#" -ne 1 ]; then
  echo "deploy script needs 1 arguments: <application>"
  exit 1
fi

. ./sitesearch-conf/envdev.sh

CURRENT_PATH=`pwd`

option=$1
mkdir -p ${SITESEARCH_INSTALL_PATH}

# Install mysql


# Install nutch
install_nutch(){
  cd sitesearch-nutch
  # make plugins.tar.gz
  cd build/apache*nutch*/runtime/local
  tar zcvf sitesearch-nutch-plugins.tar.gz plugins
  mkdir -p ${SITESEARCH_INSTALL_PATH}/nutch
  mv sitesearch-nutch-plugins.tar.gz ${SITESEARCH_INSTALL_PATH}/nutch
  cd ../deploy
  mv apache*.job ${SITESEARCH_INSTALL_PATH}/nutch
  cd ${CURRENT_PATH}
}

  # Install hadoop
install_hadoop(){
  cd sitesearch-hadoop/build/
  cp -rf hadoop* ${SITESEARCH_INSTALL_PATH}/hadoop
  cd ${CURRENT_PATH}
}

# Install workflows
install_workflows(){
  mkdir -p ${SITESEARCH_INSTALL_PATH}/workflows
  cp ${CURRENT_PATH}/sitesearch-workflows/*xml ${SITESEARCH_INSTALL_PATH}/workflows
  cd ${SITESEARCH_INSTALL_PATH}/workflows
  tar zxvf ${SITESEARCH_INSTALL_PATH}/nutch/sitesearch*.tar.gz
  mkdir -p ${SITESEARCH_INSTALL_PATH}/workflows/tmp
  cd ${SITESEARCH_INSTALL_PATH}/workflows/tmp
  jar xvf ${SITESEARCH_INSTALL_PATH}/nutch/apache*.job
  cp -rf ./lib ${SITESEARCH_INSTALL_PATH}/workflows
  find ./classes/plugins -name "*.jar" -exec cp -- "{}" ${SITESEARCH_INSTALL_PATH}/workflows/lib \;
  cp ${SITESEARCH_INSTALL_PATH}/nutch/apache*.job ${SITESEARCH_INSTALL_PATH}/workflows/lib/apache-nutch.jar
  cd ${SITESEARCH_INSTALL_PATH}/workflows && rm -rf ./tmp
  rm ${SITESEARCH_INSTALL_PATH}/hadoop/share/hadoop/common/lib/http*.jar
  rm ${SITESEARCH_INSTALL_PATH}/workflows/lib/httpcore*4.2.5*.jar
  #rm ${SITESEARCH_INSTALL_PATH}/workflows/lib/httpclient*4.2.6*.jar
  cp ${SITESEARCH_INSTALL_PATH}/workflows/lib/http*.jar ${SITESEARCH_INSTALL_PATH}/hadoop/share/hadoop/common/lib/
  cd ${CURRENT_PATH}
}

# Install oozie
install_oozie(){
  cd sitesearch-oozie/build && rm -rf ./oozie

  cp -rf oozie*/distro/target/oozie*-distro/oozie* ${SITESEARCH_INSTALL_PATH}/oozie
  mkdir -p ${SITESEARCH_INSTALL_PATH}/oozie/libext

  # copy extJS
  cp ${CURRENT_PATH}/sitesearch-archives/ext*.zip ${SITESEARCH_INSTALL_PATH}/oozie/libext

  #copy hadoop libs
  find ${SITESEARCH_INSTALL_PATH}/hadoop/share -name "*.jar" -exec cp -- "{}" ${SITESEARCH_INSTALL_PATH}/oozie/libext \;

  #copy mysql jar
  cp ${CURRENT_PATH}/sitesearch-archives/mysql*.jar ${SITESEARCH_INSTALL_PATH}/oozie/libext
  rm ${SITESEARCH_INSTALL_PATH}/oozie/libext/*hsql*.jar

  cp ${SITESEARCH_INSTALL_PATH}/hadoop/share/hadoop/mapreduce/*.jar ${SITESEARCH_INSTALL_PATH}/oozie/libext
  cd ${SITESEARCH_INSTALL_PATH}/oozie/bin
  ./oozie-setup.sh sharelib create -fs hdfs://${HADOOP_NAME_SERVER}:${HADOOP_NAME_SERVER_PORT}
  rm ${SITESEARCH_INSTALL_PATH}/oozie/lib/*sources*.jar
  rm ${SITESEARCH_INSTALL_PATH}/oozie/libext/*sources*.jar
  rm ${SITESEARCH_INSTALL_PATH}/oozie/lib/*sls*2.4.0*.jar
  ./oozie-setup.sh prepare-war

  cd ${CURRENT_PATH}
}


# Install web


case $option in
   "nutch") install_nutch;;
   "hadoop") install_hadoop;;
   "oozie") install_oozie;;
   "workflows") install_workflows;;
   "all")install_hadoop;install_nutch;install_oozie;install_workflows;;
   *) echo "Sorry, Enter an option.";;
esac
