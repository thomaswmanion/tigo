import { printUtil } from '../../util/print.util';
import { Calculator } from '../../util/calculator.util';
import { SellSymbol } from '../../robinhood/sell/sell-symbol';
import { PriceSnapshot } from '../../pricing/price-snapshot.model';
import { predictionUtil } from '../../predictions/prediction.util';
import { dateUtil } from '../../util/date.util';
import { variables } from '../../variables';

export async function run() {
  const startDate = new Date(variables.startDate);
  const endDate = new Date(variables.endDate);
  let curDate = startDate;

  const allResults: TradeResult[] = [];

  while (curDate <= endDate) {
    try {
      await predictionUtil.createPredictions(curDate);
    } catch (e) { }
    curDate = dateUtil.getNextWorkDay(curDate);
  }
  curDate = startDate;

  while (curDate <= endDate) {
    try {
      const tradeResults = await runForDate(curDate);
      allResults.push(...tradeResults);
    } catch (e) { }

    curDate = dateUtil.getNextWorkDay(curDate);
  }
  const changesPerDay = allResults.filter(a => {
    a.change = Calculator.change(a.endPrice, a.startPrice);
    if (a.numDays) {
      a.changePerDay = a.change / a.numDays;
      const changePercent = printUtil.asPercent(a.change)
      const changePercentPerDay = printUtil.asPercent(a.changePerDay);
      console.log(`${a.symbol}: ${changePercentPerDay} (${changePercent} over ${a.numDays} days)`);
      return true;
    }
    return false;
  }).map(a => a.changePerDay);
  const numValid = allResults.filter(c => !!c.numDays).length;
  const avgNumDays = allResults.filter(c => !!c.numDays).map(c => c.numDays as number).reduce((a, b) => a + b, 0) / numValid;

  const mean = Calculator.findMean(changesPerDay as number[]);
  console.log('');
  console.log(`Mean: ${printUtil.asPercent(mean)} per day, ${printUtil.asPercent(mean * avgNumDays)} per trade`);
  const yearlyValue = Math.pow(1 + (mean * avgNumDays), 250 / avgNumDays);
  console.log(`Yearly Value: ${yearlyValue} (${numValid} records, ${avgNumDays.toFixed(2)} days held average)`);
}
run();

async function runForDate(date: Date) {
  let predictions = await predictionUtil.readPredictions(date);
  let priceSnapshots = await PriceSnapshot.readForDate(date);
  let stocksToBuy = predictions.filter((_, i) => i < variables.topNumToBuy);
  const tradeResults: TradeResult[] = stocksToBuy.map(s => {
    const snap = priceSnapshots.find(s2 => s.symbol === s2.symbol);
    if (!snap) {
      return undefined;
    }
    return {
      buyDate: date,
      symbol: s.symbol,
      value: s.value,
      startPrice: snap.price,
      endPrice: 0
    };
  }).filter(a => !!a) as TradeResult[];

  let sellSymbols = tradeResults.map(s => new SellSymbol(s.symbol, 1, date, s.startPrice));

  const maxDaysTried = 30;
  let daysTried = 1;
  let done = false;
  let curDate = dateUtil.getNextWorkDay(date);
  dateUtil.overrideToday = curDate;
  while (!done && daysTried < maxDaysTried) {
    try {
      predictions = await predictionUtil.readPredictions(curDate);
      priceSnapshots = await PriceSnapshot.readForDate(curDate);
      stocksToBuy = predictions.filter((_, i) => i < variables.topNumToBuy);
      sellSymbols.forEach(sellSymbol => {
        const update = stocksToBuy.find(b => b.symbol === sellSymbol.symbol);
        if (update) {
          sellSymbol.updateLastUpdate(curDate);
        }
        if (sellSymbol.isReadyToSell()) {
          const priceSnap = priceSnapshots.find(p => p.symbol === sellSymbol.symbol);
          const tradeResult = tradeResults.find(tr => tr.symbol == sellSymbol.symbol);
          if (tradeResult && priceSnap) {
            tradeResult.endPrice = priceSnap.price;
            tradeResult.numDays = daysTried;
            sellSymbol['done'] = true;
          }
        }
      });
    } catch (e) { }
    sellSymbols = sellSymbols.filter(s => !s['done']);
    done = !tradeResults.find(a => a.endPrice === 0);
    curDate = dateUtil.getNextWorkDay(curDate);
    dateUtil.overrideToday = curDate;
    daysTried++;
  }
  return tradeResults.filter(tr => tr.endPrice > 0 && tr.startPrice !== tr.endPrice);
}

async function getLastPredictions(date: Date): Promise<string[]> {
  const lastPredictions: string[] = [];
  let curDate = date;
  for (let i = 0; i < 5; i++) {
    curDate = dateUtil.getDaysAgo(1, curDate);
    try {
      const prevPredictions = (await predictionUtil.readPredictions(curDate)).filter((_, i) => i < variables.topNumToBuy);
      lastPredictions.push(...prevPredictions.map(p => p.symbol));
    } catch (e) {

    }
  }
  return lastPredictions;
}

interface TradeResult {
  buyDate: Date;
  symbol: string;
  value: number;
  startPrice: number;
  endPrice: number;
  numDays?: number;
  change?: number;
  changePerDay?: number;
}
