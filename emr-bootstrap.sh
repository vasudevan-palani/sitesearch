cd /home/hadoop
aws s3 sync s3://sitesearch-emr-archives .
tar zxvf plugins.tgz
tar zxvf sitesearch-cron.tgz
tar zxvf sitesearch-mw.tgz
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
. ~/.nvm/nvm.sh
nvm install --lts

chmod +x *.sh

mkdir -p ~/.aws
echo "[personal]" >> ~/.aws/credentials
echo "aws_secret_access_key = mgwfqYxjd9zLL/Y2YpVEHDaWSvz9zk7DpXdNnggD" >> ~/.aws/credentials
echo "aws_access_key_id = AKIAISP3PONG4XZBJMUQ" >> ~/.aws/credentials

sudo mkdir -p /var/lib/hadoop-yarn
sudo mkdir -p /var/lib/hadoop-mapreduce
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

  sudo mkdir -p /var/lib/oozie
  sudo cp -rf ~/.aws /var/lib/oozie
  sudo chown -R oozie /var/lib/oozie/.aws

  #only in master
  cd /home/hadoop
  tar zxvf workflows.tgz
  #hdfs dfs -mkdir -p /user/hadoop/workflows/crawl
  #hdfs dfs -put /home/hadoop/workflows/* /user/hadoop/workflows/crawl

  hostname=`hostname`
  cmd="perl -pi -e 's/hadoop-master/${hostname}/g' config.js"
  cd /home/hadoop/sitesearch-cron/config
  eval $cmd
  cd /home/hadoop/sitesearch-mw/config
  eval $cmd
  cd /home/hadoop/sitesearch-mw
  #node index.js &
  cd /home/hadoop/sitesearch-cron
  #node index.js

fi
