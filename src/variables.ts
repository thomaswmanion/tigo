import { argv } from 'yargs';

class Variables {
  numPrevDays = 6;
  numPredictedDays = 6;
  
  mapStepSize = 6;
  mapSteps = 6;

  stockPickRange = 10; // days
  numSymbolsToCompare = 200;

  topNumToBuy = 10;
  minStocksForBuying = 5;

  // Testing
  startDate = '1/1/2015'
  endDate = '3/15/2018'
  testStepSize = 3;
}

export const variables = new Variables();

Object.keys(argv).forEach(key => {
  let value: any;
  if (key === 'startDate' || key === 'endDate') {
    value = argv[key];
  } else {
    try {
      value = parseFloat(argv[key]);
    } catch (e) {
      value = argv[key];
    }
  }
  
  (variables as any)[key] = value;
});
