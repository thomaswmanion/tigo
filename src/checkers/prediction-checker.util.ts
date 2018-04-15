import { printUtil } from './../util/print.util';
import { PriceSnapshot } from './../pricing/price-snapshot.model';
import { symbolUtil } from './../util/symbol.util';

import { dateUtil } from '../util/date.util';
import { PriceChange } from '../pricing/price-change.model';
import { Prediction } from '../predictions/prediction.model';
import { Calculator } from '../util/calculator.util';
import { variables } from '../variables';

class PredictionCheckerUtil {
  results: Result[] = [];
  allResultsMedians: number[] = [];
  above = 0;
  below = 0;

  v = 1;
  prevDate: Date;
  industryResults: { industry: string, change: number, total: number }[] = [];

  async checkPredictions(date: Date, predictions: Prediction[], checkAll?: boolean): Promise<Result> {
    const results: number[] = [];
    let changes: PriceChange[] = [];

    try {
      changes = await PriceChange.createFuture(date)
    } catch (e) {
      return { mean: 0, median: 0 };
    }

    if (!checkAll) {
      predictions = predictions.filter((_, i) => i < variables.topNumToBuy);

      const onlyPredictions = predictions.filter((_, i) => i < variables.topNumToBuy);
      for (const p of onlyPredictions) {
        const volatility = await PriceSnapshot.getVolatility(date, p.symbol);
        let change = changes.find(c => c.symbol === p.symbol);
        if (volatility && change) {
          // await fileUtil.appendFile('.', 'volatility.csv', `${date.toISOString()},${p.symbol},${volatility},${change.change}\n`);
        }
      }
    }

    for (const prediction of predictions) {
      const change = changes.find(p => p.symbol === prediction.symbol);
      if (change) {
        let c = change.change;
        if (c > 0.25) {
          c = 0.25;
        } else if (c < -0.25) {
          c = -0.25;
        }
        results.push(c);
        if (!checkAll) {
          console.log(change.symbol, (c * 100).toFixed(3) + '%', prediction.value);
        }
      }
    }

    const mean = Calculator.findMean(results);
    const median = Calculator.findMedian(results);
    const result = new Result(mean, median);
    return result;
  }

  abovePercent(): string {
    const frac = this.above / (this.above + this.below);
    return (frac * 100).toFixed(2) + '%';
  }

  updateVal(change: number, date: Date): number {
    let numDays = this.prevDate ? dateUtil.getWeekdayMsBetweenDates(this.prevDate, date) / dateUtil.oneDay : 1;
    this.prevDate = date;
    const c = (change / variables.numPredictedDays) * numDays;
    this.v = this.v + (this.v * c);
    return this.v;
  }

  addIndustryResult(mean: number, industry: string): void {
    let industryResult = this.industryResults.find(i => i.industry === industry)
    if (!industryResult) {
      industryResult = {
        industry, change: 0, total: 0
      };
      this.industryResults.push(industryResult);
    }
    industryResult.change += mean;
    industryResult.total++;
  }

  industryResultString(): string {
    return `[Industry Results - ${this.industryResults.map(ir => ir.industry + ' - Change: ' + printUtil.asPercent(ir.change / ir.total) + `(${ir.total})`).join(', ')}]`;
  }

  async printPredictionResults(date: Date, predictions: Prediction[]): Promise<void> {
    const result = await this.checkPredictions(date, predictions);
    const all = await this.checkPredictions(date, predictions, true);


    if (result.mean && result.median) {
      this.results.push(result);
      const allMedian = all.median * 100;
      this.allResultsMedians.push(allMedian);
      const overallAllStockMedian = Calculator.findMean(this.allResultsMedians).toFixed(3);
      const mean = (result.mean * 100).toFixed(3);
      if (result.mean > 0) {
        this.above++;
      } else if (result.mean < 0) {
        this.below++;
      }

      const industries = await symbolUtil.getCurrentIndustries();
      for (const industry of industries) {
        this.addIndustryResult(result.mean, industry);
      }

      const rMeans = this.results.map(r => r.mean);
      this.updateVal(result.mean, date);
      const overallMean = (Calculator.findMean(rMeans) * 100).toFixed(3);

      const yearlyValue = Math.pow(1 + Calculator.findMean(rMeans), 250 / variables.numPredictedDays);
      console.log(`[Date ${dateUtil.formatDate(date)} - Picked Mean: ${mean}% - All Median: ${allMedian.toFixed(3)}%]`);
      console.log(`[Overall ${dateUtil.formatDate(date)} - Picked Mean: ${overallMean}% - All Median: ${overallAllStockMedian}% - Above: ${this.above} - Below: ${this.below} - Good Picks Percent: ${this.abovePercent()} - Yearly Value: ${yearlyValue.toFixed(3)}]`);
      console.log(this.industryResultString());
      try {
        /* const last1 = PriceChange.median(await PriceChange.createPreviousNDays(date, 1)) * 100;
        const last2 = PriceChange.median(await PriceChange.createPreviousNDays(date, 6)) * 100;
        const last3 = PriceChange.median(await PriceChange.createPreviousNDays(date, 15)) * 100;
        const last4 = PriceChange.median(await PriceChange.createPreviousNDays(date, 30)) * 100; */
        // const line = `${dateUtil.formatDate(date)},${last1.toFixed(3)},${last2.toFixed(3)},${last3.toFixed(3)},${last4.toFixed(3)},${mean},${allMedian.toFixed(3)}`
        // await fileUtil.appendFile('test-data', variables.symbolFile + '.csv', line + '\n');
      } catch (e) {
        console.log(e);
      }

      const total = this.above + this.below;
      const aboveFraction = this.above / total;
      if (total > 50 && aboveFraction < 0.3) {
        console.log('Not looking good 1... Exiting.');
        return process.exit(0);
      } else if (total > 100 && aboveFraction < 0.4) {
        console.log('Not looking good 2... Exiting.');
        return process.exit(0);
      } else if (total > 150 && aboveFraction < 0.45) {
        console.log('Not looking good 3... Exiting.');
        return process.exit(0);
      }
    }
    else {
      console.log(`No result... ` + JSON.stringify(result));
    }
  }
}
export const predictionCheckerUtil = new PredictionCheckerUtil();

class Result {
  constructor(
    public mean: number,
    public median: number
  ) { }
}
