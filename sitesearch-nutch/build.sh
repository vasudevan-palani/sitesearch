. ../sitesearch-conf/env.sh
export PATH=~/Documents/tools/apache/ant/apache-ant-1.10.2/bin/:$PATH
export PATH=~/Documents/tools/apache/maven/apache-maven-3.5.0/bin/:$PATH
mkdir -p build
cd build
tar zxvf ../../sitesearch-archives/apache*nutch*.tar.gz
cd apache*
cp -rf ../../conf/* ./conf/
cp -rf ../../src/* ./src/
cp -rf ../../ivy/* ./ivy/
chmod +x ./conf/*-template.sh
. ./conf/gora.properties-template.sh > ./conf/gora.properties
. ./conf/nutch-site-template.sh > ./conf/nutch-site.xml
ant
