import { argv } from 'yargs';

class Variables {
  numPrevDays = 6;
  numPredictedDays = 6;

  deprecationAmount = 0.85;
  useSymbolSubset = true;

  topNumToBuy = 10;
  startDate = '1/1/2012'
  endDate = '1/1/2013'
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
