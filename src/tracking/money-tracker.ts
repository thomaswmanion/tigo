import { Trade } from './trade';
import { Robinhood } from '../robinhood/robinhood.api';

export class MoneyTracker {
  /**
   * Get total money (Portfolio cash + buying power)
   */
  async getCurrentMoney(robinhood: Robinhood): Promise<number> {
    const portfoliosPromise = robinhood.portfolios();
    const accountsPromise = robinhood.accounts();
    const portfolios = await portfoliosPromise;
    const accounts = await accountsPromise;

    const account = accounts.results[0];
    const buyingPower: number = parseFloat(account.margin_balances.unallocated_margin_cash);
    const marketValue: number = parseFloat(portfolios.results[0].market_value);
    return buyingPower + marketValue;
  }

  async collectTrades(account: string, earliestDate: Date, robinhood: Robinhood): Promise<Trade[]> {
    let next;
    const allResults: Trade[] = [];
    for (let i = 0; i < 20 && (next || i === 0); i++) {

      let response;
      if (i === 0) {
        response = await robinhood.orders();
      }
      else {
        response = await robinhood.get(next);
      }
      next = undefined;
      const results = response.results;

      const newResults = results.filter(r => {
        return r.state === 'filled'
      }).map(r => {
        return new Trade(account, r.side, r.instrument, parseFloat(r.average_price), new Date(r.updated_at), parseFloat(r.quantity));
      }).sort((a: Trade, b: Trade) => {
        return +a.date - +b.date;
      }).filter((a: Trade) => {
        return a.date > earliestDate;
      });
      if (newResults) {
        allResults.push(...newResults);
        next = response.next;
      }
    }
    return allResults.filter((a: Trade) => {
      return a.date > earliestDate;
    }).sort((a: Trade, b: Trade) => {
      return +a.date - +b.date;
    });
  }
}

export type MoneyAtTime = {
  value: number,
  date: Date
};