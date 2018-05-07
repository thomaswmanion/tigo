import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';

export class Popularity {
  static dir = 'popularity';
  constructor(
    public symbol: string,
    public numBuyRatings: number,
    public numHoldRatings: number,
    public numSellRatings: number
  ) { }

  static async save(date: Date, popularities: Popularity[]): Promise<void> {
    await fileUtil.saveObject(this.dir, dateUtil.formatDate(date) + '.json', popularities);
  }

  getValue(): number {
    const total = this.numBuyRatings + this.numSellRatings + this.numHoldRatings;
    let value = 0;
    if (total !== 0) {
      value = (this.numBuyRatings + this.numHoldRatings) / total;
    }

    value += this.numBuyRatings / 1000;

    return value;
  }

  static async read(date: Date): Promise<Popularity[]> {
    const pops = await fileUtil.readObject(this.dir, dateUtil.formatDate(date) + '.json');
    return pops.map(p => new Popularity(p.symbol, p.numBuyRatings, p.numHoldRatings, p.numSellRatings));
  }
}
