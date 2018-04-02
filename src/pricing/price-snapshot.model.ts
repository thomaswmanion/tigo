import { dateUtil } from '../util/date.util';
import { fileUtil } from '../util/file.util';
import { Calculator } from '../util/calculator.util';
import { variables } from '../variables';

export class PriceSnapshot {
  static dir: string = 'price-snapshots';

  constructor(
    public symbol: string,
    public price: number,
    public date: Date
  ) { }

  static async existsForDate(date: Date): Promise<boolean> {
    const exists = await fileUtil.exists(this.dir, this.convertDateToFilename(date));
    return exists;
  }


  static async getVolatility(date: Date, symbol: string): Promise<number> {
    let curDate: Date = date;
    let prevDate: Date = dateUtil.getDaysAgo(variables.numPrevDays, curDate);
    let volatility = 0;
    let count = 0;
    for (let i = 0; i < variables.volatilityDays; i++) {
      try {
        const curs = await this.readForDate(curDate)
        const prevs = await this.readForDate(prevDate);
        const cur = curs.find(c => c.symbol === symbol);
        const prev = prevs.find(p => p.symbol === symbol);
        if (cur && prev) {
          volatility += Math.abs(Calculator.change(cur.price, prev.price));
          count++;
        }

      } catch (e) {

      }


      curDate = dateUtil.getDaysAgo(variables.numPrevDays, curDate);
      prevDate = dateUtil.getDaysAgo(variables.numPrevDays, prevDate);
    }
    return count > 0 ? volatility / count : 0;
  }

  static async readForDate(date: Date): Promise<PriceSnapshot[]> {
    const str: string = await fileUtil.readString(this.dir, this.convertDateToFilename(date));
    return str.trim().split(/[\n\r]+/).map(i => {
      const parts = i.split(',');
      const symbol = parts[0];
      const price = parseFloat(parts[1]);
      return new PriceSnapshot(symbol, price, date);
    });
  }

  static async writeForDate(date: Date, priceSnapshots: PriceSnapshot[]): Promise<void> {
    const csv = priceSnapshots.map(p => `${p.symbol},${p.price}`).join('\n');
    await fileUtil.saveString(this.dir, this.convertDateToFilename(date), csv);
  }

  static convertFilenameToDate(filename: string): Date {
    return new Date(filename.replace('.csv', ''));
  }

  static convertDateToFilename(fileDate: Date): string {
    return dateUtil.formatDate(fileDate) + '.csv';
  }

  static async readNearDate(date: Date, numPrevious: number = 3): Promise<PriceSnapshot[]> {
    for (let i = 0; i < numPrevious; i++) {
      try {
        return await this.readForDate(date);
      } catch (e) {
      }
      date = dateUtil.getPreviousWorkDay(date);
    }
    return [];
  }
}