import { argv } from 'yargs';

class Variables {
  numPrevDays = 6;
  numPredictedDays = 6;

  mapStepSize = 6;
  mapSteps = 6;
  longMapSteps = 30;

  numTopIndustries = 1;
  minIndustryMedian = -1;

  numSymbolsToCompare = 200;

  topNumToBuy = 10;
  minStocksForBuying = 5;

  // Change
  includeIncrease = 1;
  includeDecrease = 1;

  // Volatility
  numPrevousVolatilitySteps = 50;
  numDiscoveryTries = 10000;
  maxVolatilityRules = 200;

  // Testing
  startDate = '4/17/2018';
  endDate = '5/27/2018';
  volatilityDays = 10;
  testStepSize = 1;

  symbolFile = 'all';
  indicatorTypes = ['popularity', 'change'];
  changeWeight = 0;
  volatilityWeight = 1;
  popularityWeight = 1;

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
