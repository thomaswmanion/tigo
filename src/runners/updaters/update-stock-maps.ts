import { dateUtil } from '../../util/date.util';
import { HistoricalChangeUpdater } from '../../historical-changes/historical-change.updater';
import { variables } from '../../variables';

export async function run() {
  const date = dateUtil.getDaysAgo(variables.numPredictedDays, dateUtil.today);
  const updater = new HistoricalChangeUpdater();
  await updater.updateForSymbols(date);
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
