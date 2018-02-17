import { PriceSnapshot } from '../../pricing/price-snapshot.model';
import { fileUtil } from '../../util/file.util';
import { dateUtil } from '../../util/date.util';

export async function run() {
  const startDate = new Date('1/1/2012');
  const endDate = new Date('1/1/2018');
  for (let curDate = startDate; curDate < endDate; curDate = dateUtil.getNextWorkDay(curDate)) {
    const filename = `results-${dateUtil.formatDate(curDate)}.json`;
    if (await fileUtil.exists('day-results-fake', filename)) {
      const obj: any[] = await fileUtil.readObject('day-results-fake', filename);
      try {
        const snaps = obj
          .filter(o => o.stock && o.quoteDataResult)
          .map(o => new PriceSnapshot(o.stock.symbol, o.quoteDataResult.last_trade_price, new Date(o.day)))
          .filter(o => o.symbol && o.price && o.date);
        if (snaps.length > 100) {
          await PriceSnapshot.writeForDate(curDate, snaps);
          console.log(dateUtil.formatDate(curDate), snaps.length);
        }
      } catch (e) { }

    }
  }
}
run();
