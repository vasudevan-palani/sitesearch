. ../sitesearch-conf/env.sh
export PATH=~/Documents/tools/apache/ant/apache-ant-1.10.2/bin/:$PATH
export PATH=~/Documents/tools/apache/maven/apache-maven-3.5.0/bin/:$PATH
mkdir -p build
cd build
tar zxvf ../../sitesearch-archives/oozie*.tar.gz
cd oozie*
cp -rf ../../src/* .
chmod +x ./core/src/main/conf/oozie-site-template.sh
. ./core/src/main/conf/oozie-site-template.sh > ./core/src/main/conf/oozie-site.xml
cd bin
./mkdistro.sh -DskipTests -X
