import { PriceChange } from './../pricing/price-change.model';
import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { Prediction, PredictionDate } from './prediction.model';
import { indicatorUtil } from '../indicators/indicator.util';
import { Indicator } from '../indicators/indicator.model';
import { symbolUtil } from '../util/symbol.util';
import { variables } from '../variables';
import * as fs from 'fs-extra';
import * as path from 'path';

class PredictionUtil {
  async createPredictions(date: Date): Promise<Prediction[]> {
    console.log(`${dateUtil.formatDate(date)} - Creating predictions.`);

    const allIndicators: Indicator[][] = [];

    for (const type of variables.indicatorTypes) {

      try {

        const indicators = await indicatorUtil.readAndSortIndicatorsForDateAndType(date, type);
        indicators.forEach(indicator => indicator.type = type);
        console.log(indicators.length);
        allIndicators.push(indicators);
        console.log(`Collected ${type}.`);
      } catch (e) { }

    }

    let futureResults: PriceChange[] = [];
    try {
      futureResults = await PriceChange.createFuture(date)
    } catch (e) { }

    const symbols = await symbolUtil.getSymbols();
    const predictions: Prediction[] = [];
    for (const symbol of symbols) {
      const indicatorsForSymbol: Indicator[] = allIndicators.map(indicators => indicators.find(i => i.symbol === symbol)).filter(i => i && i.value !== 0) as Indicator[];
      let value = indicatorsForSymbol.map(a => a.value).reduce((a, b) => a + b, 0);
      // value += indicatorsForSymbol.length;

      if (value > 0) {
        try {
          await this.appendDetails(date, symbol, indicatorsForSymbol, futureResults);
        } catch (e) { }

        predictions.push(new Prediction(symbol, value));
      }
    }
    predictions.sort((a, b) => b.value - a.value);
    const ps = predictions.filter((_, i) => i < variables.topNumToBuy).map((a) => `${a.symbol}: ${a.value.toFixed(3)}`);
    console.log(`Predictions: ${ps.join(', ')}`);
    if (predictions.length) {
      await fileUtil.saveObject(Prediction.dir, `${dateUtil.formatDate(date)}.json`, predictions);
    }
    return predictions;
  }

  async readPredictions(date: Date): Promise<Prediction[]> {
    const raw = await fileUtil.readObject(Prediction.dir, `${dateUtil.formatDate(date)}.json`);
    return raw.map(rawP => new Prediction(rawP.symbol, rawP.value));
  }

  async appendDetails(date: Date, symbol: string, indicatorsForSymbol: Indicator[], futureResults: PriceChange[]) {
    const pop = indicatorsForSymbol.find(s => s.type === 'popularity');
    const direction = indicatorsForSymbol.find(s => s.type === 'direction');
    const volatility = indicatorsForSymbol.find(s => s.type === 'volatility');
    const zachs = indicatorsForSymbol.find(s => s.type === 'zachs');
    const relativeStrength = indicatorsForSymbol.find(s => s.type === 'relative-strength');
    const kst = indicatorsForSymbol.find(s => s.type === 'kst');
    const futureResult = futureResults.find(fr => fr.symbol === symbol);
    if (futureResult) {
      const line = [
        dateUtil.formatDate(date),
        symbol,
        pop ? pop.value : 0,
        direction ? direction.value : 0,
        volatility ? volatility.value : 0,
        zachs ? zachs.value : 0,
        relativeStrength ? relativeStrength.value : 0,
        kst ? kst.value : 0,
        futureResult.change
      ].join(',') + '\n';

      await fs.appendFile(
        path.join(fileUtil.tempestHome, 'data.csv'),
        line,
        { encoding: 'utf-8' }
      );
    }
  }

  async readTopPredictions(date: Date): Promise<Prediction[]> {
    const p = await this.readPredictions(date);
    return p.filter((_, i) => i < variables.topNumToBuy);
  }

  async getRecentPredictions(date: Date): Promise<PredictionDate[]> {
    const predictions: PredictionDate[] = [];
    let curDate = date;
    for (let i = 0; i < variables.numPredictedDays; i++) {
      try {
        const p = await this.readTopPredictions(curDate);
        predictions.push(...p.map(ps => new PredictionDate(ps, curDate)));
      } catch (e) { }
      curDate = dateUtil.getPreviousWorkDay(curDate);
    }
    return predictions;
  }
}

export const predictionUtil = new PredictionUtil();
