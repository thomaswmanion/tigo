import { Calculator } from '../util/calculator.util';
import { dateUtil } from '../util/date.util';
import { PriceSnapshot } from './price-snapshot.model';
import { variables } from '../variables';

export class PriceChange {
  symbol: string = this.curSnap.symbol;
  change: number = Calculator.change(this.curSnap.price, this.prevSnap.price);

  constructor(
    public prevSnap: PriceSnapshot,
    public curSnap: PriceSnapshot
  ) { }

  static createPrevious(date: Date): Promise<PriceChange[]> {
    return this.createPreviousNDays(date, variables.numPrevDays);
  }

  static createPreviousNDays(date: Date, n: number): Promise<PriceChange[]> {
    const prevDate = dateUtil.getDaysAgo(n, date);
    return this.createChange(date, prevDate);
  }

  static median(priceChanges: PriceChange[]): number {
    return Calculator.findMedian(priceChanges.map(p => p.change));
  }

  static createFutureNDays(date: Date, n: number): Promise<PriceChange[]> {
    const futureDate = dateUtil.getDaysInTheFuture(n, date);
    return this.createChange(futureDate, date);
  }

  static createFuture(date: Date): Promise<PriceChange[]> {
    return this.createFutureNDays(date, variables.numPredictedDays);
  }

  static async createChange(date: Date, prevDate: Date): Promise<PriceChange[]> {
    const today = await PriceSnapshot.readForDate(date);
    const prev = await PriceSnapshot.readForDate(prevDate);

    let changes = today.map(t => {
      const p = prev.find(pr => pr.symbol === t.symbol);
      return p && t ? new PriceChange(p, t) : undefined;
    }).filter(p => p instanceof PriceChange) as PriceChange[];

    return changes;
  }
}