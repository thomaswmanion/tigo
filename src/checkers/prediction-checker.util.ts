import { dateUtil } from '../util/date.util';
import { PriceChange } from '../pricing/price-change.model';
import { Prediction } from '../predictions/prediction.model';
import { Calculator } from '../util/calculator.util';
import { variables } from '../variables';

class PredictionCheckerUtil {
  results: Result[] = [];
  allResultsMeans: number[] = [];
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
      }
    }

    const mean = Calculator.findMean(results);
    const median = Calculator.findMedian(results);
    const result = new Result(mean, median);
    return result;
  }

  async printPredictionResults(date: Date, predictions: Prediction[]): Promise<void> {
    const result = await this.checkPredictions(date, predictions);
    const all = await this.checkPredictions(date, predictions, true);

    if (result.mean && result.median) {
      this.results.push(result);
      const allMean = all.mean * 100;
      this.allResultsMeans.push(allMean);
      const overallAllStockMean = Calculator.findMean(this.allResultsMeans).toFixed(3);
      const mean = (result.mean * 100).toFixed(3);
      const median = (result.median * 100).toFixed(3);
      const rMeans = this.results.map(r => r.mean);
      const overallMean = (Calculator.findMean(rMeans) * 100).toFixed(3);
      const overallMedian = (Calculator.findMedian(rMeans) * 100).toFixed(3);
      console.log(`${dateUtil.formatDate(date)} - Mean: ${mean}% - Median: ${median}% - All Stock Mean: ${all.mean.toFixed(3)}% - Overall Mean: ${overallMean}% - Overall Median: ${overallMedian}% - Overall All Stock Mean: ${overallAllStockMean}%`);
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
