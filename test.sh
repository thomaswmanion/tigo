rm -rf test-results/ ~/tempest/test-data/
rm -rf ~/tempest/volatility.csv

mkdir -p test-results
mkdir -p ~/tempest/test-data

#while read variables; do
#  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
#done < test-cases 

ts-node src/runners/testing/run-regression.ts | tee -- "test-results/base"
ts-node src/runners/testing/run-regression.ts --relativeStrengthWeight=0.5 | tee -- "test-results/base-rsi"
for i in {1..150}; do
  a=`node -p "Math.random()"`
  b=`node -p "Math.random()"`
  c=`node -p "Math.random()"`
  d=`node -p "Math.random()"`
  e=`node -p "Math.random()"`
  f=`node -p "Math.random()"`
  #vo=`node -p "Math.floor(Math.random() * 30)"`
  #days=`node -p "Math.floor(Math.random() * 15)"`
  variables="--directionWeight=$a --volatilityWeight=$b --popularityWeight=$c --zachsRatingWeight=$d --zachsBonusWeight=$e --relativeStrengthWeight=$f"
  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
done
