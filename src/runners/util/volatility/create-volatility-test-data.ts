import { PriceChange } from '../../../pricing/price-change.model';
import { dateUtil } from '../../../util/date.util';
import { variables } from '../../../variables';
import { fileUtil } from '../../../util/file.util';
export async function run() {
  const startDate = new Date('01/01/2012');
  const endDate = new Date();
  let curDate = startDate;
  let totalLines = 0;
  await fileUtil.removeFile('test', 'volatility.csv');

  while (curDate < endDate) {
    try {
      console.log('Starting ' + dateUtil.formatDate(curDate));
      const linesAdded = await appendFileForDate(curDate);
      totalLines += linesAdded;
      console.log(dateUtil.formatDate(curDate) + `, ${linesAdded}. Total Lines: ${totalLines}`);
    } catch (e) {
      console.log(e.message);
    }

    curDate = dateUtil.getNextWorkDay(curDate);
  }
}
run();

async function appendFileForDate(date: Date): Promise<number> {
  let lines = 0;
  const days = await PriceChange.createPreviousNDays(date, 1);
  const weeks = await PriceChange.createPreviousNDays(date, 5);
  const months = await PriceChange.createPreviousNDays(date, 20);
  const quarters = await PriceChange.createPreviousNDays(date, 60);
  const futures = await PriceChange.createFutureNDays(date, variables.numPredictedDays);
  for (const day of days) {
    const week = weeks.find(i => i.symbol === day.symbol);
    const month = months.find(i => i.symbol === day.symbol);
    const quarter = quarters.find(i => i.symbol === day.symbol);
    const future = futures.find(i => i.symbol === day.symbol);
    if (day && week && month && quarter && future) {
      await fileUtil.appendFile('test', 'volatility.csv', [
        day.change,
        week.change,
        month.change,
        quarter.change,
        future.change
      ].join(',') + '\n');
      lines++;
    }
  }
  return lines;
}