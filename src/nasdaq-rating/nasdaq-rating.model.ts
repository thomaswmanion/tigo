import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';

export class NasdaqRating {
  static dir = 'nasdaq-rating';
  constructor(
    public symbol: string,
    public fraction: number
  ) { }

  static async save(date: Date, nasdaqRatings: NasdaqRating[]): Promise<void> {
    await fileUtil.saveObject(this.dir, dateUtil.formatDate(date) + '.json', nasdaqRatings);
  }

  static async read(date: Date): Promise<NasdaqRating[]> {
    const pops = await fileUtil.readObject(this.dir, dateUtil.formatDate(date) + '.json');
    return pops.map(p => new NasdaqRating(p.symbol, p.fraction));
  }
}
