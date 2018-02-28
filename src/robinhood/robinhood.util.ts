import { dateUtil } from '../util/date.util';
import { Robinhood, PositionResult } from './robinhood.api';

export class RobinhoodUtil {
  constructor(
    public robinhood: Robinhood
  ) { }

  async getAllPositions(): Promise<PositionResult[]> {
    const accounts = await this.robinhood.accounts();
    const positions: PositionResult[] = [];
    let positionsResults = await this.robinhood.get(accounts.results[0].positions + '?nonzero=true');
    positions.push(...positionsResults.results);
    while (positionsResults.next) {
      positionsResults = await this.robinhood.get(positionsResults.next);
      if (positionsResults.results) {
        positions.push(...positionsResults.results);
      }
    }
    return positions;
  }

  async getAllPositionsInflated(): Promise<Position[]> {
    const positions = await this.getAllPositions();
    return Promise.all(positions.map(async (p) => {
      const instrument = await this.robinhood.get(p.instrument);
      const averageBuyPrice = parseFloat(p.average_buy_price);
      const quantity = parseFloat(p.quantity);
      const symbol = instrument.symbol;
      return { symbol, quantity, averageBuyPrice };
    }));
  }

  async isMarketOpen(): Promise<boolean> {
    const markets = await this.robinhood.get('https://api.robinhood.com/markets/XNYS/hours/' + dateUtil.formatDate(dateUtil.today) + '/');
    console.log(markets);
    return markets.is_open;
  }

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
}

export interface Position {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
}