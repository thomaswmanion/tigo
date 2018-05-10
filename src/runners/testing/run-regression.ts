import { PopularityIndicator } from './../../popularity/popularity.indicator';
import { PriceSnapshot } from './../../pricing/price-snapshot.model';
import { predictionCheckerUtil } from '../../checkers/prediction-checker.util';
import { Prediction } from '../../predictions/prediction.model';
import { predictionUtil } from '../../predictions/prediction.util';
import { StockMap } from '../../historical-changes/stock-map.model';
import { Indicator } from '../../indicators/indicator.model';
import { fileUtil } from '../../util/file.util';
import { HistoricalChangeUpdater } from '../../historical-changes/historical-change.updater';
import { dateUtil } from '../../util/date.util';
import prettyMs from 'pretty-ms';
import { variables } from '../../variables';
import { StockPickerUtil } from '../../predictions/stock-picker/stock-picker.util';
import { VolatilityIndicator } from '../../volatility/volatility.indicator';

export async function run() {
  console.log(`Clearing folders...`);
  await fileUtil.empty(Indicator.dir);
  await fileUtil.empty(StockMap.dir);
  await fileUtil.empty(Prediction.dir);

  const startDate = new Date(variables.startDate);
  const endDate = new Date(variables.endDate);
  let curDate = startDate;

  const startTime = Date.now();
  const updater = new HistoricalChangeUpdater();
  const volatilityIndicator = new VolatilityIndicator();

  for (let i = 0; curDate < endDate; i++ , curDate = dateUtil.getDaysInTheFuture(variables.testStepSize, curDate)) {
    const dateStartTime = Date.now();
    dateUtil.overrideToday = curDate;
    const previousDate = dateUtil.getDaysAgo(variables.numPrevDays, curDate);
    const futureDate = dateUtil.getDaysInTheFuture(variables.numPredictedDays, curDate);
    const prevExists = await PriceSnapshot.existsForDate(previousDate);
    const curExists = await PriceSnapshot.existsForDate(curDate);
    const futureExists = await PriceSnapshot.existsForDate(futureDate);

    if (prevExists && curExists && futureExists) {
        try {
          if (variables.indicatorTypes.indexOf('change') !== -1 && variables.changeWeight > 0) {
            await updater.createChangeIndicatorsForDate(curDate);
          }
          if (variables.indicatorTypes.indexOf('long-change') !== -1 && variables.changeWeight > 0) {
            await updater.createChangeIndicatorsForDate(curDate, 'long-change');
          }
          if (variables.indicatorTypes.indexOf('volatility') !== -1 && variables.volatilityWeight > 0) {
            await volatilityIndicator.createVolatilityIndicatorsForDate(curDate);
          }
          if (variables.indicatorTypes.indexOf('popularity') !== -1 && variables.popularityWeight > 0) {
            const popIndicator = new PopularityIndicator();
            await popIndicator.createPopularityIndicatorsForDate(curDate);
          }

          const predictions = await predictionUtil.createPredictions(curDate);
          if (predictions && predictions.length > 0) {
            await predictionCheckerUtil.printPredictionResults(curDate, predictions);
          } else {
            console.log('Invalid predictions');
          }
        } catch (e) {
          console.log(e);
        }
    }
    //const prevDate = dateUtil.getDaysAgo(variables.numPredictedDays, curDate);
    // await updater.updateForSymbols(prevDate);

    console.log(`Runtime for ${dateUtil.formatDate(curDate)}: ${prettyMs(Date.now() - dateStartTime)}, Total: ${prettyMs(Date.now() - startTime)}`);
  }

  console.log('Runtime: ' + prettyMs(Date.now() - startTime));
}
run();
