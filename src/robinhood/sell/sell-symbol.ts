import { dateUtil } from '../../util/date.util';
import { variables } from '../../variables';

export class SellSymbol {
  constructor(public symbol: string, public quantity: number, public lastUpdate: Date, public averageBuyPrice?: number) { }

  isReadyToSell(): boolean {
    const hasTimeElapsed = this.hasEnoughTimeElapsedFromDate(this.lastUpdate, variables.numPredictedDays);
    // console.log('isReadyToSell', this.symbol, this.lastUpdate, hasTimeElapsed);
    return hasTimeElapsed;
  }

  updateLastUpdate(date: Date): void {
    if (date > this.lastUpdate) {
      this.lastUpdate = date;
    }
  }

  hasEnoughTimeElapsedFromDate(lastUpdate: Date, numDays: number): boolean {
    let sellDate = dateUtil.getDaysInTheFuture(numDays, lastUpdate);
    sellDate = new Date(+sellDate - (dateUtil.oneDay / 2));

    return +dateUtil.today > +sellDate;
}
}

