if [ $# -ne 1 ]
then
	echo "Usage : ./start.sh <env>"
	exit 1
fi
cp config/config.$1.js config/config.js
. ~/.aws_profile
node index.js
