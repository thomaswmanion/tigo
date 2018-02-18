import { PriceSnapshot } from '../../pricing/price-snapshot.model';
import { dateUtil } from '../../util/date.util';
import { fileUtil } from '../../util/file.util';

export async function run() {
  const drs = (await fileUtil.ls('day-results')).filter(i => i.includes('results'));
  for (const dr of drs) {
    try {
      console.log(dr);
      const date = new Date(dr.replace('.json', '').replace('results-', ''));
      console.log(date);
      const arr: any[] = await fileUtil.readObject('day-results', dr);
      const csvContent = arr.map(a => {
        const symbol = a.stock && a.stock.symbol;
        const price = a.quoteDataResult && a.quoteDataResult.last_trade_price
        return { symbol, price };
      }).filter(i => i.symbol && i.price).map(i => `${i.symbol.replace('$', '')},${i.price}`)
      if (csvContent.length > 0) {
        const filename = dateUtil.formatDate(date) + '.csv';
        console.log(`Writing file ${filename} with ${csvContent.length} records.`);
        await fileUtil.saveString(PriceSnapshot.dir, filename, csvContent.join('\n') + '\n');
      }
    } catch (e) {
      console.log(e.message);
    }
  }
}
run();
