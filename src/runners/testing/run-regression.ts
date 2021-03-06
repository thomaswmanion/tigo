import { WprIndicator } from './../../wpr/wpr.indicator';
import { KstIndicator } from './../../kst/kst.indicator';
import { RelativeStrengthIndicator } from './../../relative-strength/relative-strength.indicator';
import { ZachsIndicator } from './../../zachs/zachs.indicator';
import { NasdaqRatingIndicator } from './../../nasdaq-rating/nasdaq-rating.indicator';
import { DirectionIndicator } from './../../direction/direction.indicator';
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

        if (variables.indicatorTypes.indexOf('direction') !== -1 && variables.directionWeight > 0) {
          const directionIndicator = new DirectionIndicator();
          await directionIndicator.createDirectionIndicatorsForDate(curDate);
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
        if (variables.indicatorTypes.indexOf('nasdaq-rating') !== -1 && variables.nasdaqRatingWeight > 0) {
          const nasdaqRatingIndicator = new NasdaqRatingIndicator();
          await nasdaqRatingIndicator.createNasdaqRatingIndicatorsForDate(curDate);
        }

        if (variables.indicatorTypes.indexOf('zachs') !== -1 && variables.zachsRatingWeight > 0) {
          const zachsIndicator = new ZachsIndicator();
          await zachsIndicator.createZachsIndicatorsForDate(curDate);
        }

        if (variables.indicatorTypes.indexOf('relative-strength') !== -1 && variables.relativeStrengthWeight > 0) {
          const relativeStrengthIndicator = new RelativeStrengthIndicator();
          await relativeStrengthIndicator.createIndicatorsForDate(curDate);
        }
        if (variables.indicatorTypes.indexOf('kst') !== -1 && variables.kstWeight > 0) {
          const kstIndicator = new KstIndicator();
          await kstIndicator.createIndicatorsForDate(curDate);
        }
        if (variables.indicatorTypes.indexOf('wpr') !== -1 && variables.wprWeight > 0) {
            const wpr = new WprIndicator();
            await wpr.createIndicatorsForDate(curDate);
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
