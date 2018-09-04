sh check-test.sh | tee out
best=`cat out | grep 8-27 | awk -F 'Yearly Value: ' '{print $2}' | awk -F ']' '{print $1}' | sort -ru | head -1`
echo "Best ====== $best"
cat out | grep "$best"
