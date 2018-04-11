if [ $# -ne 1 ]
then
	echo "Usage : ./start.sh <env>"
	exit 1
fi
cp config/config.$1.js config/config.js
export SECRET_ACCESS_KEY=8qEuoc0Rmrl4lViZ22BJcfPzPX+Uvy6xdkj6kzjz
export ACCESS_KEY_ID=AKIAJ3CBWMH67UXP4MMQ
node index.js
