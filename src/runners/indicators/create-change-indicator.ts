import { KstIndicator } from './../../kst/kst.indicator';
import { RelativeStrengthIndicator } from './../../relative-strength/relative-strength.indicator';
import { ZachsIndicator } from './../../zachs/zachs.indicator';
import { VolatilityIndicator } from './../../volatility/volatility.indicator';
import { PopularityIndicator } from './../../popularity/popularity.indicator';
import { dateUtil } from '../../util/date.util';
import { DirectionIndicator } from '../../direction/direction.indicator';

export async function createChangeIndicator() {
  const popIndicator = new PopularityIndicator();
  await popIndicator.createPopularityIndicatorsForDate(dateUtil.today);
  const dirIndicator = new DirectionIndicator();
  await dirIndicator.createDirectionIndicatorsForDate(dateUtil.today);
  const volIndicator = new VolatilityIndicator();
  await volIndicator.createVolatilityIndicatorsForDate(dateUtil.today);
  const relativeStrengthIndicator = new RelativeStrengthIndicator();
  await relativeStrengthIndicator.createIndicatorsForDate(dateUtil.today);
  const zachsIndicator = new ZachsIndicator();
  await zachsIndicator.createZachsIndicatorsForDate(dateUtil.today);
  const kstIndicator = new KstIndicator();
  await kstIndicator.createIndicatorsForDate(dateUtil.today);
}
createChangeIndicator().catch(e => {
  console.error(e);
  process.exit(1);
});
