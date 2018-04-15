rm -rf test-results/ ~/tempest/test-data/
rm -rf ~/tempest/volatility.csv

mkdir -p test-results
mkdir -p ~/tempest/test-data

while read variables; do
  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
done < test-cases 
