#!/bin/bash

# first, save everything into temporary files
temp=.$(date +%N)survey
mkdir ${temp}
counter=0

cat $1 | 
	
	while IFS=$'\t' read id userid kml json datetime
	do 
		if [ "${kml}" != "NOT ON CAMPUS" ]
		then
			echo { \"response\": ${json}, \"database-id\": ${id}, \"user-id\": \"${userid}\", \"submission-timestamp\": \"${datetime}\" } > ${temp}/survey-data-${counter}.txt
			counter=$(($counter+1))
		fi
	done

	echo { 
	echo '    '\"type\": \"FeatureCollection\",
	echo '    '\"features\": [

	totalRecords=$(wc -l $1 | awk '{ print $1 }')

	recordNumber=0
	for filename in $(ls ${temp})
	do
		echo $filename >&2
		./dishpan.py ${temp}/${filename} $recordNumber $totalRecords 
		rm ${temp}/${filename}
		recordNumber=$(($recordNumber+1))
	done

	echo $'    ']
	echo }

rmdir ${temp}

exit 0