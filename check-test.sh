 ls ./test-results | while read file; do
  result=`grep Mean < "./test-results/$file" | tail -1`
  #overallMean=`echo "$result" | awk -F 'Overall Mean: ' '{print $2}' | awk -F '%' '{print $1}'`
  #numPredictedDays=`echo "$file" | awk -F 'numPredictedDays=' '{print $2}'`
  #echo $numPredictedDays
  echo "$file $result"
done
