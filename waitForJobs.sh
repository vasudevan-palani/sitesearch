iteration=0

while [ $iteration -le 10 ]
do
	count=`yarn  application  -appStates RUNNING -list | grep Total | cut -f4 -d':'`
	echo $count
	if [ $count -ne 0 ]
	then
		iteration=0
	else
		iteration=$(($iteration + 1))
	fi
	sleep 5
done

