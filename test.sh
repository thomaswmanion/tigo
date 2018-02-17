rm -rf test-results/
mkdir -p test-results
while read variables; do
  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
done < test-cases 
