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

  for (let i = 0; curDate < endDate; i++ , curDate = dateUtil.getNextWorkDay(curDate)) {
    const dateStartTime = Date.now();
    dateUtil.overrideToday = curDate;

    if (i > 10) {
      await updater.createChangeIndicatorsForDate(curDate);
      const predictions = await predictionUtil.createPredictions(curDate);
      if (predictions && predictions.length > 0) {
        await predictionCheckerUtil.printPredictionResults(curDate, predictions);
      } else {
        console.log('Invalid predictions');
      }
    }

    const prevDate = dateUtil.getDaysAgo(variables.numPredictedDays, curDate);
    await updater.updateForSymbols(prevDate);

    console.log(`Runtime for ${dateUtil.formatDate(curDate)}: ${prettyMs(Date.now() - dateStartTime)}, Total: ${prettyMs(Date.now() - startTime)}`);
  }

  console.log('Runtime: ' + prettyMs(Date.now() - startTime));
}
run();
