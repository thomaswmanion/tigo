import { argv } from 'yargs';

class Variables {
  numPrevDays = 6;
  numPredictedDays = 6;

  deprecationAmount = 0.85;
  useSymbolSubset = true;
  symbolSubset = 3;

  topNumToBuy = 10;
  minStocksForBuying = 5;
  startDate = '1/1/2018'
  endDate = '3/10/2018'
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
