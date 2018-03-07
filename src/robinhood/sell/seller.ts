import { dateUtil } from './../../util/date.util';
import { LastUpdateManager } from './last-update-manager';
import { CredentialsManager } from '../credentials-manager';
import { Robinhood, InstrumentResult } from '../robinhood.api';
import { RobinhoodUtil } from '../robinhood.util';
import { SellSymbol } from './sell-symbol';
import { argv } from 'yargs';

export class Seller {
  async runSell(): Promise<void> {
    const credentials = await CredentialsManager.readCredentials();
    const robinhood = new Robinhood(credentials.username, credentials.password);
    await robinhood.login();
    const robinhoodUtil = new RobinhoodUtil(robinhood);
    const isMarketOpen = await robinhoodUtil.isMarketOpen();
    if (!isMarketOpen) {
      console.log('Market is not open... Exiting');
      return;
    }
    const positions = await robinhoodUtil.getAllPositions();
    console.log('Positions: ' + positions.length);
    let sellSymbols: SellSymbol[] = await Promise.all(positions.map(async p => {
        const instrument: InstrumentResult = await robinhood.get(p.instrument);
        const quantity = parseFloat(p.quantity);
        return new SellSymbol(instrument.symbol, quantity, new Date(p.updated_at), parseFloat(p.average_buy_price));
    }));
    const manager = new LastUpdateManager(robinhood, dateUtil.today);
    await manager.inflateData();
    manager.updateLastUpdates(sellSymbols);
    await this.sellStocks(robinhood, sellSymbols);
  }

  async sellStocks(robinhood: Robinhood, sellSymbols: SellSymbol[]) {
      const symbolsReady = sellSymbols.filter(s => s.isReadyToSell());
      for (const ss of symbolsReady) {
        console.log(`${ss.symbol} is ready to sell - ${ss.quantity} stocks`);
        if (argv.prod) {
            const price = await robinhood.sell(ss.symbol, ss.quantity);
            console.log(`${ss.symbol} Sell Request at ${price}`);
        }
      }
  }
}


/*
async function run() {
  const credentials = await CredentialsManager.readCredentials();
  const robinhood = new Robinhood(credentials.username, credentials.password);
  await robinhood.login();
  const robinhoodUtil = new RobinhoodUtil(robinhood);
  const isMarketOpen = await robinhoodUtil.isMarketOpen();
  if (!isMarketOpen) {
      console.log('Market is not open... Exiting');
      return;
  }
  const positions = await robinhoodUtil.getAllPositions();

  let sellSymbols: SellSymbol[] = await Promise.all(positions.map(async p => {
      const instrument: InstrumentResult = await robinhood.get(p.instrument);
      const quantity = parseFloat(p.quantity);
      return new SellSymbol(instrument.symbol, quantity, new Date(p.created_at), new Date(p.updated_at), parseFloat(p.average_buy_price));
  }));

  sellStocks(robinhood, sellSymbols);
}
run();

async function sellStocks(robinhood: Robinhood, sellSymbols: SellSymbol[]) {
  const recentPredictions: PredictionResult[] = [];
  let curDate = dateUtil.today;
  for (let i = 0; i < variables.numDays; i++) {
      try {
          recentPredictions.push(...(await PredictionResult.readPredictionsForDate(curDate)));
      }
      catch (e) { }
      curDate = dateUtil.getPreviousWorkDay(curDate);
  }
  const symbolsPurchasedToday = await getStocksPurchasedOnDate(robinhood, dateUtil.today);
  console.log('Stocks purchased today: ' + symbolsPurchasedToday.join(', '));
  for (let i = 0; i < sellSymbols.length; i++) {
      const sellSymbol = sellSymbols[i];
      if (symbolsPurchasedToday.indexOf(sellSymbol.symbol) !== -1) {
          console.log(`${sellSymbol.symbol} was purchased today. Skipping...`);
      } else {
          try {
              const currentPrice = await robinhood.getPriceBySymbol(sellSymbol.symbol);
              const buyPrice = sellSymbol.averageBuyPrice;
              const increase = Calculator.changePercent(currentPrice, buyPrice);
              const changeInMs = Date.now() - +sellSymbol.lastUpdate;
              const changeInDays = changeInMs / dateUtil.oneDay;
              console.log(`${sellSymbol.symbol} - Current Price: $${currentPrice}, Buy Price: $${buyPrice}, Increase: %${increase.toFixed(2)}, Date Purchased: ${dateUtil.formatDate(sellSymbol.lastUpdate)} (${changeInDays.toFixed(1)} days ago)`);
              if (await sellSymbol.isReadyToSell(recentPredictions, currentPrice, buyPrice)) {
                  console.log(`${sellSymbol.symbol} is ready to sell - ${sellSymbol.quantity} stocks`);
                  const price = await robinhood.sell(sellSymbol.symbol, sellSymbol.quantity);
                  console.log(`${sellSymbol.symbol} Sell Request at ${price}`);
              }
          } catch (e) {
              console.log(e);
          }
      }
  }
  console.log('Completed selling.');
}

async function getStocksPurchasedOnDate(r: Robinhood, date: Date): Promise<string[]> {
  const stocks: string[] = [];
  const oResponse = await r.orders();
  const sellOrders = oResponse.results.filter(r => r.side === 'buy' && r.state !== 'cancelled');
  const sellOrdersToday = sellOrders.filter(d => {
      const updatedAt = dateUtil.formatDate(new Date(d.updated_at));
      const lastTransactionAt = dateUtil.formatDate(new Date(d.last_transaction_at));
      const createdAt = dateUtil.formatDate(new Date(d.created_at));
      const today = dateUtil.formatDate(date);
      return today === updatedAt || today === createdAt || today === lastTransactionAt;
  });
  for (let i = 0; i < sellOrdersToday.length; i++) {
      const order = sellOrdersToday[i];
      const instrument = await r.get(order.instrument);
      stocks.push(instrument.symbol);
  }
  return stocks;
}
*/