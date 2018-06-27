import { Calculator } from '../util/calculator.util';
import { PriceSnapshot } from '../pricing/price-snapshot.model';
import { Position } from '../robinhood/robinhood.util';
import { Trade, TradeResult } from './trade';
import { Robinhood } from '../robinhood/robinhood.api';

export class Wallet {
  testMoney: number = 0;
  wallet: any = {};
  numBuys: number = 0;
  numSells: number = 0;
  constructor(
    public trades: Trade[]
  ) { }

  createTradeResults(): TradeResult[] {
    const results: TradeResult[] = [];
    this.empty();

    this.trades.forEach(trade => {
      if (trade.side === 'buy') {
        this.buy(trade);
      }
      else if (trade.side === 'sell') {
        results.push(...this.sell(trade));
      }
    })

    return results;
  }

  getPositions(): Position[] {
    const symbols = this.getOwnedSymbols();
    return symbols.map(symbol => {
      const quantity = this.getQuantityOwnedOfSymbol(symbol);
      const averageBuyPrice = this.getAverageBuyPriceForSymbol(symbol);
      return { symbol, quantity, averageBuyPrice };
    })
  }

  getWalletValue(priceSnapshots: PriceSnapshot[]): number {
    const symbols = this.getOwnedSymbols();
    if (symbols.length === 0) {
      return 0;
    }
    return symbols.map(s => {
      const snapshot = priceSnapshots.find(p => p.symbol === s);
      const price = snapshot && snapshot.price;
      const avgBuyPrice = this.getAverageBuyPriceForSymbol(s);
      const valueOfSymbol = this.wallet[s].map(item => item.number * (price || avgBuyPrice)).reduce((a, b) => a + b);
      return valueOfSymbol;
    }).reduce((a, b) => a + b);
  }

  empty(): void {
    this.wallet = {};
    this.numBuys = 0;
    this.numSells = 0;
  }

  buy(trade: Trade) {
    // if (trade.symbol === 'ETRM') {
    //  return;
    // }
    if (trade.quantity === 0) {
      return;
    }
    this.numBuys++;
    this.wallet[trade.symbol] = this.wallet[trade.symbol] || [];
    this.wallet[trade.symbol].push({
      price: trade.price,
      number: trade.quantity,
      purchaseDate: trade.date
    });
  }

  getOwnedSymbols(): string[] {
    return Object.keys(this.wallet).filter(i => {
      return Array.isArray(this.wallet[i]) && this.wallet[i].length > 0;
    });
  }

  getQuantityOwnedOfSymbol(symbol: string): number {
    return this.wallet[symbol].map(a => a.number).reduce((a, b) => a + b);
  }

  getCreatedDateForSymbol(symbol: string): Date {
    const smallest = Math.min(...this.wallet[symbol].map(a => +a.purchaseDate));
    return new Date(smallest);
  }
  setLastPrice(symbol: string, lastPrice: number): void {
    this.wallet[symbol].forEach(i => i.lastPrice = lastPrice);
  }

  getLastUpdateForSymbol(symbol: string): Date {
    const biggest = Math.max(...this.wallet[symbol].map(a => +a.purchaseDate));
    return new Date(biggest);
  }

  getAverageBuyPriceForSymbol(symbol: string): number {
    const prices = this.wallet[symbol].map(a => a.price);
    return Calculator.findMean(prices);
  }

  isSymbolOwned(symbol: string): boolean {
    return this.wallet[symbol] && this.wallet[symbol].length > 0;
  }

  sellAll(trade: Trade): TradeResult[] {
    const symbolWallet: any[] = this.wallet[trade.symbol];
    if (!symbolWallet) {
      return [];
    }
    const tradeResults: TradeResult[] = [];

    while (symbolWallet.length > 0) {
      this.numSells++;
      const current = symbolWallet.shift();
      tradeResults.push(new TradeResult(trade.symbol, current.purchaseDate, current.price, trade.date, trade.price, current.number, trade.account));
    }
    return tradeResults;
  }

  sell(trade: Trade): TradeResult[] {
    if (!this.wallet[trade.symbol]) {
      return [];
    }
    this.numSells++;
    let amount = trade.quantity;
    const tradeResults: TradeResult[] = [];
    while (amount > 0 && this.wallet[trade.symbol].length > 0) {
      const current = this.wallet[trade.symbol][0];
      const amountToSpend = Math.min(current.number, trade.quantity)
      tradeResults.push(new TradeResult(trade.symbol, current.purchaseDate, current.price, trade.date, trade.price, amountToSpend, trade.account));
      amount = amount - amountToSpend;
      current.number = current.number - amountToSpend;
      if (current.number <= 0) {
        this.wallet[trade.symbol].shift();
      }
    }
    return tradeResults;
  }

  async getResultsStillInWallet(robinhood: Robinhood): Promise<TradeResult[]> {
    const tradeResults: TradeResult[] = [];
    for (let symbol in this.wallet) {
      const purchases = this.wallet[symbol];
      if (purchases.length > 0) {
        const price = await robinhood.getPriceBySymbol(symbol);
        tradeResults.push(...(purchases as any[])
          .filter(p => p.number)
          .map(p => {
            return new TradeResult(symbol, p.purchaseDate, p.price, new Date(), price, p.number, '');
          }));
      }
    }

    return tradeResults;
  }
}
