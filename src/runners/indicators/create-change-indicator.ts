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
}
createChangeIndicator().catch(e => {
  console.error(e);
  process.exit(1);
});
