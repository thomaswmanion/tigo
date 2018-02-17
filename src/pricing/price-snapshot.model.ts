import { dateUtil } from '../util/date.util';
import { fileUtil } from '../util/file.util';

export class PriceSnapshot {
  static dir: string = 'price-snapshots';

  constructor(
    public symbol: string,
    public price: number,
    public date: Date
  ) {}

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
}