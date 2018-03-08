import { argv } from 'yargs';

class Variables {
  numPrevDays = 6;
  numPredictedDays = 6;
  
  numPrevMapDays = 50;
  deprecationAmount = 1;
  useSymbolSubset = true;
  symbolSubset = 3;

  topNumToBuy = 10;
  minStocksForBuying = 5;
  startDate = '1/1/2016'
  endDate = '1/1/2018'
}

export const variables = new Variables();

Object.keys(argv).forEach(key => {
  let value: any;
  if (key === 'startDate' || key === 'endDate') {
    value = argv[key];
  } else if (key === 'useSymbolSubset') {
    value = argv[key] === 'true';
  } else {
    try {
      value = parseFloat(argv[key]);
    } catch (e) {
      value = argv[key];
    }
  }
  
  (variables as any)[key] = value;
});
