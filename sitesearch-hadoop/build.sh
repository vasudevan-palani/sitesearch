. ../sitesearch-conf/env.sh
export PATH=~/Documents/tools/apache/ant/apache-ant-1.10.2/bin/:$PATH
export PATH=~/Documents/tools/apache/maven/apache-maven-3.5.0/bin/:$PATH
mkdir -p build
cd build
tar zxvf ../../sitesearch-archives/hadoop*.tar.gz
cd hadoop*
cp -rf ../../src/* .
chmod +x ./etc/hadoop/*-template.sh
. ./etc/hadoop/core-site-template.sh > ./etc/hadoop/core-site.xml
. ./etc/hadoop/mapred-site-template.sh > ./etc/hadoop/mapred-site.xml
echo -e "export JAVA_HOME=${JAVA_HOME}\n$(cat ./etc/hadoop/hadoop-env.sh)" > ./etc/hadoop/hadoop-env.sh
echo -e "export JAVA_HOME=${JAVA_HOME}\n$(cat ./etc/hadoop/yarn-env.sh)" > ./etc/hadoop/yarn-env.sh
