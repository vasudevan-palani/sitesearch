. ./env.sh

CURRENT_PATH=`pwd`

sbin/start-all.sh
sbin/mr-jobhistory-daemon.sh --config ./etc/hadoop/ start historyserver
