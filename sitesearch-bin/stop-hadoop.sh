. ./env.sh

CURRENT_PATH=`pwd`

sbin/stop-all.sh
sbin/mr-jobhistory-daemon.sh --config ./etc/hadoop/ stop historyserver
