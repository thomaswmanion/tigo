rm -rf test-results/ ~/tempest/test-data/
rm -rf ~/tempest/volatility.csv

mkdir -p test-results
mkdir -p ~/tempest/test-data

while read variables; do
  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
done < test-cases 

#for i in {1..150}; do
#  p=`node -p "Math.random()"`
#  d=`node -p "Math.random()"`
#  v=`node -p "Math.random()"`
#  n=`node -p "Math.round(Math.random())"`
#  vo=`node -p "Math.floor(Math.random() * 30)"`
#  days=`node -p "Math.floor(Math.random() * 15)"`
#  variables="--popularityWeight=$p --directionWeight=$d --volatilityWeight=$v --justifyPopularityCounts=$n --numPrevousVolatilitySteps=$vo --numPrevDays=$days --numPredictedDays=$days"
#  variables="--justifyPopularityCounts=$n --numPrevousVolatilitySteps=$vo --numPrevDays=$days --numPredictedDays=$days"
#  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
#done