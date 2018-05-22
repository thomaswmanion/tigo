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
  maxVolatility = 0.05;

  // Testing
  startDate = '4/17/2018';
  endDate = '5/27/2018';
  volatilityDays = 10;
  testStepSize = 1;

  symbolFile = 'all';
  indicatorTypes = ['popularity', 'direction', 'volatility'];
  changeWeight = 1;
  directionWeight = 0.017403542409448303;
  volatilityWeight = 0.6960913192452312;
  popularityWeight = 0.9133038580684016;

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
