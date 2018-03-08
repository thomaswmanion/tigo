
import { dateUtil } from '../util/date.util';
import { PriceChange } from '../pricing/price-change.model';
import { Prediction } from '../predictions/prediction.model';
import { Calculator } from '../util/calculator.util';
import { variables } from '../variables';

class PredictionCheckerUtil {
  results: Result[] = [];
  allResultsMeans: number[] = [];
  above = 0;
  below = 0;

  v = 1;
  prevDate: Date;

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

  async printPredictionResults(date: Date, predictions: Prediction[]): Promise<void> {
    const result = await this.checkPredictions(date, predictions);
    const all = await this.checkPredictions(date, predictions, true);

    if (result.mean && result.median) {
      this.results.push(result);
      // const allMean = all.mean * 100;
      const allMedian = all.median * 100;
      this.allResultsMeans.push(allMedian);
      // this.allResultsMeans.push(allMean);
      const overallAllStockMean = Calculator.findMean(this.allResultsMeans).toFixed(3);
      // const mean = (result.mean * 100).toFixed(3);
      const median = (result.median * 100).toFixed(3);
      if (result.median > 0) {
        this.above++;
      } else if (result.median < 0) {
        this.below++;
      }
      const rMeans = this.results.map(r => r.mean);
      this.updateVal(result.mean, date);
      // const overallMean = (Calculator.findMean(rMeans) * 100).toFixed(3);
      const overallMedian = (Calculator.findMedian(rMeans) * 100).toFixed(3);
      console.log(`${dateUtil.formatDate(date)} - Median: ${median}% - All Stock Median: ${allMedian.toFixed(3)}% - Overall Mean: ${overallMedian}% - Overall All Stock Mean: ${overallAllStockMean}% - Above: ${this.above} - Below: ${this.below} - Above Percent: ${this.abovePercent()} - Val: ${this.v.toFixed(3)}`);
      // console.log(`${dateUtil.formatDate(date)} - Mean: ${mean}% - All Stock Mean: ${allMean.toFixed(3)}% - Overall Mean: ${overallMean}% - Overall All Stock Mean: ${overallAllStockMean}%`);
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
