import { argv } from 'yargs';

import { printUtil } from '../../util/print.util';
import { Calculator } from '../../util/calculator.util';
import { fileUtil } from '../../util/file.util';
let lines: string[];

export async function run() {
  let highestInRange = 0;
  let highestInRangeResult: Result = {} as any;

  let highestOutOfRange = 0;
  let highestOutOfRangeResult: Result = {} as any;

  for (let i = 0; i < 1; i += 0.01) {
    console.log(i.toFixed(3));
    for (let j = i; j < 1; j += 0.01) {
      const result = await runHighLow(j, i);
      if (result.inRange > highestInRange) {
        highestInRangeResult = result;
        highestInRange = result.inRange;
      }
      if (result.outOfRange > highestOutOfRange) {
        highestOutOfRangeResult = result;
        highestOutOfRange = result.outOfRange;
      }
    }
  }
  console.log(JSON.stringify(highestInRangeResult));
  console.log('High In Range - Overall: ' + printUtil.asPercent(highestInRangeResult.overall));
  console.log('High In Range - In Range: ' + printUtil.asPercent(highestInRangeResult.inRange));
  console.log('High In Range - Out of Range: ' + printUtil.asPercent(highestInRangeResult.outOfRange));
  console.log('\n==============================\n');
  console.log(JSON.stringify(highestOutOfRangeResult));
  console.log('High Out of In Range - Overall: ' + printUtil.asPercent(highestOutOfRangeResult.overall));
  console.log('High Out of In Range - In Range: ' + printUtil.asPercent(highestOutOfRangeResult.inRange));
  console.log('High Out of In Range - Out of Range: ' + printUtil.asPercent(highestOutOfRangeResult.outOfRange));

}

export async function runHighLow(high: number, low: number, print?: boolean): Promise<Result> {
  if (!lines) {
    const csv = await fileUtil.readString('.', 'volatility.csv');
    lines = (csv as string).trim().split(/[\n\r]+/g);
  }

  const inRange: number[] = [];
  const outOfRange: number[] = [];
  let highestVolatility = -1;
  let lowestVolatility = 2;
  let volatilities: number[] = [];
  for (const line of lines) {
    const pieces = line.split(',');
    let change = parseFloat(pieces[3]);
    if (change > 0.1) {
      change = 0.1;
    } else if (change < -0.1) {
      change = -0.1;
    }
    const volatility = parseFloat(pieces[2]);
    if (volatility > 10 || volatility < -10) {
      continue;
    }
    if (volatility < lowestVolatility) {
      lowestVolatility = volatility;
    }
    if (volatility > highestVolatility) {
      highestVolatility = volatility;
    }
    volatilities.push(volatility);
    if (volatility >= low && volatility <= high) {
      inRange.push(change);
    } else {
      outOfRange.push(change);
    }
  }

  if (print) {
    console.log('High Volatility: ' + highestVolatility);
    console.log('Low Volatility: ' + lowestVolatility);
    console.log('Mean Volatility: ' + Calculator.findMean(volatilities));
    console.log('Median Volatility: ' + Calculator.findMedian(volatilities));
    console.log('\n==============================\n');

    console.log('Overall: ' + printUtil.asPercent(Calculator.findMean([...inRange, ...outOfRange])));
    console.log('In Range: ' + printUtil.asPercent(Calculator.findMean(inRange)) + ` (${inRange.length})`);
    console.log('Out of Range: ' + printUtil.asPercent(Calculator.findMean(outOfRange)) + ` (${outOfRange.length})`);
  }
  let total = inRange.length + outOfRange.length;
  const inRangeFraction = inRange.length / total;
  const outOfRangeFraction = outOfRange.length / total;

  if (inRangeFraction > 0.1 && outOfRangeFraction > 0.1) {
    return {
      high,
      low,
      overall: Calculator.findMean([...inRange, ...outOfRange]),
      inRange: Calculator.findMean(inRange),
      outOfRange: Calculator.findMean(outOfRange)
    }
  } else {
    return {
      high: 0,
      low: 0,
      overall: 0,
      inRange: 0,
      outOfRange: 0
    };
  }


}
if (argv.high || argv.low) {
  runHighLow(parseFloat(argv.high), parseFloat(argv.low), true);
} else {
  run();
}

interface Result {
  high: number;
  low: number;
  overall: number;
  inRange: number;
  outOfRange: number;
}
