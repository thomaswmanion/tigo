import { fileUtil } from '../../util/file.util';
import { Robinhood } from '../../robinhood/robinhood.api';
import { CredentialsManager } from '../../robinhood/credentials-manager';
import { dateUtil } from '../../util/date.util';
import { Wallet } from './../../tracking/wallet';
import { TradeResult } from '../../tracking/trade';
import { MoneyTracker } from '../../tracking/money-tracker';
import { variables } from '../../variables';

export async function createTradesCsv() {
  const creds = await CredentialsManager.readCredentials();
  const robinhood = new Robinhood(creds.username, creds.password);
  await robinhood.login();
  const to = new Date();
  const numDays = 60;
  const from = dateUtil.getDaysAgo(numDays, to); // new Date(variables.startDate);
  console.log(`Date Range (${numDays} days): ` + dateUtil.formatDate(from) + ' - ' + dateUtil.formatDate(to));

  let allResults = await new MoneyTracker().collectTrades(creds.username, from, robinhood);
  await Promise.all(allResults.map(a => a.inflateFromInstrument(robinhood)));
  const wallet = new Wallet(allResults);
  const tradeResults: TradeResult[] = wallet.createTradeResults();

  const headers = ['Stock', 'Purchase Date', 'Purchase Price', 'Sell Date', 'Sell Price', 'Number', 'Change Percent', 'Weekdays Held', 'Change Percent per Weekday'].join(',');
  const lines = headers + '\n' + tradeResults.map(t => {
    return [t.stock, t.purchaseDate, t.purchasePrice, t.sellDate, t.sellPrice, t.num, t.changePercent, t.numDays, t.percentEarningPerDay].join(',');
  }).join('\n');
  const file = `trades-from-${dateUtil.formatDate(from)}-to-${dateUtil.formatDate(to)}.csv`;
  await fileUtil.saveString('trade-history', file, lines);
  console.log(`File ${file} created!`);
}
createTradesCsv();
