import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { Prediction, PredictionDate } from './prediction.model';
import { indicatorUtil } from '../indicators/indicator.util';
import { Indicator } from '../indicators/indicator.model';
import { symbolUtil } from '../util/symbol.util';
import { variables } from '../variables';
class PredictionUtil {
  async createPredictions(date: Date): Promise<Prediction[]> {
    console.log(`${dateUtil.formatDate(date)} - Creating predictions.`);
    const indicatorTypes = ['change'];

    const allIndicators: Indicator[][] = [];

    for (const type of indicatorTypes) {

      try {
        const indicators = await indicatorUtil.readAndSortIndicatorsForDateAndType(date, type);
        allIndicators.push(indicators);
      } catch (e) { }

    }

    const symbols = await symbolUtil.getSymbols();
    const predictions: Prediction[] = [];
    for (const symbol of symbols) {
      const indicatorsForSymbol: Indicator[] = allIndicators.map(indicators => indicators.find(i => i.symbol === symbol)).filter(i => i && i.value !== 0) as Indicator[];
      const value = indicatorsForSymbol.map(a => a.value).reduce((a, b) => a + b, 0);

      if (value !== 0) {
        predictions.push(new Prediction(symbol, value));
      }

    }
    predictions.sort((a, b) => b.value - a.value);
    if (predictions.length) {
      await fileUtil.saveObject(Prediction.dir, `${dateUtil.formatDate(date)}.json`, predictions);
    }
    return predictions;
  }

  async readPredictions(date: Date): Promise<Prediction[]> {
    const raw: any[] = await fileUtil.readObject(Prediction.dir, `${dateUtil.formatDate(date)}.json`);
    return raw.map(rawP => new Prediction(rawP.symbol, rawP.value));
  }

  async getRecentPredictions(date: Date): Promise<PredictionDate[]> {
    const predictions: PredictionDate[] = [];
    let curDate = date;
    for (let i = 0; i < variables.numPredictedDays; i++) {
      try {
        const p = await this.readPredictions(curDate);
        predictions.push(...p.map(ps => new PredictionDate(ps, curDate)));
      } catch (e) { }
      curDate = dateUtil.getPreviousWorkDay(curDate);
    }
    return predictions;
  }
}

export const predictionUtil = new PredictionUtil();
