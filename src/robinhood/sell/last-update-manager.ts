import { Order, OrderResponseBody } from './../robinhood.api';
import { SellSymbol } from './sell-symbol';
import { predictionUtil } from '../../predictions/prediction.util';
import { PredictionDate } from '../../predictions/prediction.model';
import { Robinhood } from '../robinhood.api';
import { dateUtil } from '../../util/date.util';

export class LastUpdateManager {
  recentPredictions: PredictionDate[];
  symbolsPurchasedOnDate: string[];
  recentTrades: { symbol: string, date: Date }[];

  constructor(
    public robinhood: Robinhood,
    public date: Date
  ) { }

  async inflateData(): Promise<void> {
    await this.inflateRecentPredictions();
    await this.inflateSymbolsPurchasedOnDate();
  }
  async inflateRecentPredictions(): Promise<void> {
    this.recentPredictions = await predictionUtil.getRecentPredictions(this.date);
  }
  async inflateSymbolsPurchasedOnDate() {
    const today = dateUtil.formatDate(this.date);
    const stocks: string[] = [];
    const oResponse = await this.robinhood.orders();
    let results: Order[] = [...oResponse.results];
    let next = oResponse.next;
    for (let i = 0; i < 3 && next; i++) {
      const moreOrders: OrderResponseBody = await this.robinhood.get(next);
      results.push(...moreOrders.results);
      next = moreOrders.next;
    }
    const sellOrders = results.filter(r => r.side === 'buy' && r.state !== 'cancelled');
    const sellOrdersToday = sellOrders.filter(d => {
      const updatedAt = dateUtil.formatDate(new Date(d.updated_at));
      const lastTransactionAt = dateUtil.formatDate(new Date(d.last_transaction_at));
      const createdAt = dateUtil.formatDate(new Date(d.created_at));
      return today === updatedAt || today === createdAt || today === lastTransactionAt;
    });
    for (let i = 0; i < sellOrdersToday.length; i++) {
      const order = sellOrdersToday[i];
      const instrument = await this.robinhood.get(order.instrument);
      stocks.push(instrument.symbol);
    }
    this.symbolsPurchasedOnDate = stocks;
    const recentResults = results.filter(r => r.state !== 'cancelled');
    this.recentTrades = [];
    for (const res of recentResults) {
      const inst = await this.robinhood.get(res.instrument);
      const biggestDate = Math.max(
        +new Date(res.updated_at),
        +new Date(res.created_at),
        +new Date(res.last_transaction_at)
      );
      this.recentTrades.push({
        symbol: inst.symbol,
        date: new Date(biggestDate)
      });
    }
  }
  updateLastUpdates(sellSymbols: SellSymbol[]): void {
    for (const ss of sellSymbols) {
      const symbolRecentPredictions = this.recentPredictions.filter(p => p.prediction.symbol === ss.symbol);
      symbolRecentPredictions.forEach(r => ss.updateLastUpdate(r.date))
      const symbolsPurchasedOnDate = this.symbolsPurchasedOnDate.find(s => ss.symbol === s);
      if (symbolsPurchasedOnDate) {
        ss.updateLastUpdate(this.date);
      }
      const recentTrades = this.recentTrades.filter(t => t.symbol === ss.symbol);
      for (const trade of recentTrades) {
        ss.updateLastUpdate(trade.date);
      }
    }
  }
}
