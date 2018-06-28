i=1
mkdir -p ~/tempest/nasdaq-images
for symbol in `node -p "require('./symbols.json').sort((a, b) => Math.random() > 0.5).join(' ')"`; do
  sleep 2
  echo "$i - Downloading symbol: $symbol";
  curl -s "https://www.nasdaq.com/charts/${symbol}_rm.jpeg" > ~/tempest/nasdaq-images/$symbol.jpeg || true
  i=$((i + 1))
done
