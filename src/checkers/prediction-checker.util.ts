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
  industryResults: { industry: string, above: number, below: number }[] = [];

  async checkPredictions(date: Date, predictions: Prediction[], checkAll?: boolean): Promise<Result> {
    const results: number[] = [];
    let changes: PriceChange[] = [];
    if (!checkAll) {
      predictions = predictions.filter((_, i) => i < variables.topNumToBuy);
    }
    try {
      changes = await PriceChange.createFuture(date)
    } catch (e) {
      return { mean: 0, median: 0 };
    }

    for (const prediction of predictions) {
      const change = changes.find(p => p.symbol === prediction.symbol);
      if (change) {
        results.push(change.change);
        if (!checkAll) {
          console.log(change.symbol, (change.change * 100).toFixed(3) + '%');
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
        industry, below: 0, above: 0
      };
      this.industryResults.push(industryResult);
    }
    if (mean > 0) {
      industryResult.above++;
    } else if (mean < 0) {
      industryResult.below++;
    }
  }

  industryResultString(): string {
    return `[Industry Results - ${this.industryResults.map(ir => ir.industry + ' - Above: ' + ir.above + ' - Below: ' + ir.below).join(', ')}]`;
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

      const industry = await symbolUtil.getCurrentIndustry();
      this.addIndustryResult(result.mean, industry);

      const rMeans = this.results.map(r => r.mean);
      this.updateVal(result.mean, date);
      const overallMean = (Calculator.findMean(rMeans) * 100).toFixed(3);
      console.log(`[${dateUtil.formatDate(date)} - Picked Mean: ${mean}% - All Median: ${allMedian.toFixed(3)}%]`);
      console.log(`[Overall - Picked Mean: ${overallMean}% - All Median: ${overallAllStockMedian}% - Above: ${this.above} - Below: ${this.below} - Good Picks Percent: ${this.abovePercent()} - Val: ${this.v.toFixed(3)} ]`);
      console.log(this.industryResultString());
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
