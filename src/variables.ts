import { argv } from 'yargs';

class Variables {
  numPrevDays = 5;
  numPredictedDays = 5;

  mapStepSize = 5;
  mapSteps = 5;
  longMapSteps = 30;

  numTopIndustries = 1;
  minIndustryMedian = -1;

  numSymbolsToCompare = 200;

  topNumToBuy = 20;
  minStocksForBuying = 5;

  // Change
  includeIncrease = 1;
  includeDecrease = 1;
  changeAmount = 0.05;

  // Volatility
  numPrevousVolatilitySteps = 20;
  numKstSteps = 40;
  maxVolatility = 0.05;

  // Testing
  // startDate = '4/17/2018';
  // startDate = '6/1/2018';
  startDate = '7/1/2018';
  endDate = '7/20/2018';
  volatilityDays = 10;
  testStepSize = 1;

  symbolFile = 'all';
  indicatorTypes = ['popularity', 'direction', 'volatility', 'zachs', 'relative-strength', 'kst'];
  changeWeight = 0;
  directionWeight = 0.1; // 0.06329439146188465; //0.9133038580684016;
  volatilityWeight = 0; // 0.6896129933778206;
  popularityWeight = 0; // 0.5155262904678888;
  relativeStrengthWeight = 1; // 0.036733819676656676;
  kstWeight = 0; // 0.036733819676656676;
  nasdaqRatingWeight = 0;
  zachsRatingWeight = 0; // 0.5650440714229403;
  zachsBonusWeight = 0.001; // 0.9243612055039385;

  divideResultByIncrease = 0;
}

export const variables = new Variables();

Object.keys(argv).forEach(key => {
  let value: any;
  if (key === 'indicatorTypes') {
    value = argv[key].split(',');
  } else if (key === 'startDate' || key === 'endDate' || key === 'symbolFile') {
    value = argv[key];
  } else {
    try {
      value = parseFloat(argv[key]);
    } catch (e) {
      value = argv[key];
    }
  }
  if (key === 'size') {
    const num = parseFloat(argv[key]);
    variables.numPrevDays = num;
    variables.numPredictedDays = num;
    variables.mapStepSize = num;
  }

  (variables as any)[key] = value;
});
