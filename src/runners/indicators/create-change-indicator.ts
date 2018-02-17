import { dateUtil } from '../../util/date.util';
import { HistoricalChangeUpdater } from '../../historical-changes/historical-change.updater';

export async function createChangeIndicator() {
  const updater = new HistoricalChangeUpdater();
  await updater.createChangeIndicatorsForDate(dateUtil.today);
}
createChangeIndicator().catch(e => {
  console.error(e);
  process.exit(1);
});
