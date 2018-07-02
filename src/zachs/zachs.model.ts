import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';

export class Zachs {
  static dir = 'zachs';
  constructor(
    public symbol: string,
    public rating: number, // higher is good, converted from zachs lower is good
    public rank: number, // 1 is good
    public total: number // total in industry
  ) { }

  static async save(date: Date, obs: Zachs[]): Promise<void> {
    await fileUtil.saveObject(this.dir, dateUtil.formatDate(date) + '.json', obs);
  }

  static async read(date: Date): Promise<Zachs[]> {
    const pops = await fileUtil.readObject(this.dir, dateUtil.formatDate(date) + '.json');
    return pops.map(p => new Zachs(p.symbol, p.rating, p.rank, p.total));
  }
}
