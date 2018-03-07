import { Calculator } from '../util/calculator.util';
import { dateUtil } from '../util/date.util';
import { PriceSnapshot } from './price-snapshot.model';
import { variables } from '../variables';
import { symbolUtil } from '../util/symbol.util';

export class PriceChange {
  symbol: string = this.curSnap.symbol;
  change: number = Calculator.change(this.curSnap.price, this.prevSnap.price);

  constructor(
    public prevSnap: PriceSnapshot,
    public curSnap: PriceSnapshot
  ) { }

  static createPrevious(date: Date): Promise<PriceChange[]> {
    const prevDate = dateUtil.getDaysAgo(variables.numPrevDays, date);
    return this.createChange(date, prevDate);
  }

  static createFuture(date: Date): Promise<PriceChange[]> {
    const futureDate = dateUtil.getDaysInTheFuture(variables.numPredictedDays, date);
    return this.createChange(futureDate, date);
  }

  static async createChange(date: Date, prevDate: Date): Promise<PriceChange[]> {
    const today = await PriceSnapshot.readForDate(date);
    const prev = await PriceSnapshot.readForDate(prevDate);

    let changes = today.map(t => {
      const p = prev.find(pr => pr.symbol === t.symbol);
      return p && t ? new PriceChange(p, t) : undefined;
    }).filter(p => p instanceof PriceChange) as PriceChange[];

    if (variables.useSymbolSubset) {
      const symbols = await symbolUtil.getSymbols();
      changes = changes.filter(c => symbols.indexOf(c.symbol) !== -1);
    }
    return changes;
  }
}