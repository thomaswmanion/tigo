#rm -rf test-results/ ~/tempest/test-data/
rm -rf ~/tempest/volatility.csv

mkdir -p test-results
mkdir -p ~/tempest/test-data
rm -rf ~/tempest/indicators/
# ts-node src/runners/testing/run-regression.ts | tee -- "test-results/base"

while read variables; do
rm -rf ~/tempest/indicators/
  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
done < test-cases 
exit 0
for i in {1..150}; do
  a=`node -p "Math.random().toFixed(3)"`
  b=`node -p "Math.random().toFixed(3)"`
  c=`node -p "Math.random().toFixed(3)"`
  d=`node -p "Math.random().toFixed(3)"`
  e=`node -p "Math.random().toFixed(3)"`
  f=`node -p "Math.random().toFixed(3)"`
  #g=`node -p "Math.random().toFixed(3)"`
  g=0
  rm -rf ~/tempest/indicators/
  variables="--directionWeight=$a --volatilityWeight=$b --popularityWeight=$c --zachsRatingWeight=$d --zachsBonusWeight=$e --relativeStrengthWeight=$f --kstWeight=$g"
  ts-node src/runners/testing/run-regression.ts $variables | tee -- "test-results/$variables"
done


  #vo=`node -p "Math.floor(Math.random() * 30)"`
  #days=`node -p "Math.floor(Math.random() * 15)"`