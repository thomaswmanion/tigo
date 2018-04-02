import { VolatilityIndicator } from './../../volatility/volatility.indicator';
import { dateUtil } from '../../util/date.util';

export async function createChangeIndicator() {
  const indicator = new VolatilityIndicator();
  await indicator.createVolatilityIndicatorsForDate(dateUtil.today);
}
createChangeIndicator().catch(e => {
  console.error(e);
  process.exit(1);
});
