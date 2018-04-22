hdfs dfs -mkdir -p /user/hadoop/oozieapps/crawl
hdfs dfs -put /home/hadoop/workflows/* /user/hadoop/oozieapps/crawl

sudo cp -rf ~/.aws /var/lib/hadoop-yarn
sudo cp -rf ~/.aws /var/lib/hadoop-mapreduce
sudo chown -R mapred /var/lib/hadoop-mapreduce/.aws
sudo chown -R yarn /var/lib/hadoop-yarn/.aws

# check for master node
IS_MASTER=true
if [ -f /mnt/var/lib/info/instance.json ]
then
	IS_MASTER=`cat /mnt/var/lib/info/instance.json | tr -d '\n ' | sed -n 's|.*\"isMaster\":\([^,}]*\).*|\1|p'`
fi

if [ "$IS_MASTER" = true ]
then
  sudo cp -rf ~/.aws /var/lib/oozie
  sudo chown -R oozie /var/lib/oozie/.aws
fi
. ~/.nvm/nvm.sh
cd /home/hadoop/sitesearch-cron
node $1.js

. /home/hadoop/waitForJobs.sh
