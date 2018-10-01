import { argv } from 'yargs';
import { QuoteDataResult } from '../robinhood.api';
import { SymbolTradeMeta } from '../symbol-trade-meta.model';
import { dateUtil } from '../../util/date.util';

import { Robinhood } from '../robinhood.api';
import { CredentialsManager } from '../credentials-manager';
import { predictionUtil } from '../../predictions/prediction.util';
import { variables } from '../../variables';
import { RobinhoodUtil, Position } from '../robinhood.util';
import { Canceller } from '../canceller';
import { PurchaseAllocator } from './purchase-allocator';

export class Buyer {
    async buyStocks(robinhood: Robinhood, meta: SymbolTradeMeta[]) {
        console.log('Stocks to Buy = ', meta.map(r => r.symbol + ': ' + r.count).join(', '))
        let price: number;
        meta = meta.filter(b => b.count !== 0);
        for (const sc of meta) {
            console.log(`Requesting ${sc.count} shares of ${sc.symbol}...`);
            if (argv.prod) {
                price = await robinhood.buy(sc.symbol, sc.count);
                console.log(`Completed purchase request for ${sc.count} shares of ${sc.symbol}!`, price);
            }
        }
        console.log('Completed purchases.');
    }

    async getStocksSoldOnDate(r: Robinhood, date: Date): Promise<string[]> {
        const stocks: string[] = [];
        const oResponse = await r.orders();
        const sellOrders = oResponse.results.filter(r => r.side === 'sell' && r.state !== 'cancelled');
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

    async runBuy(date: Date): Promise<void> {
        const credentials = await CredentialsManager.readCredentials();
        const predictions = await predictionUtil.readPredictions(date);
        const stocksToBuy = predictions.filter((_, i) => i < variables.topNumToBuy).map(p => new SymbolTradeMeta(p.symbol));

        const robinhood = new Robinhood(credentials.username, credentials.password);
        await robinhood.login();
        const robinhoodUtil = new RobinhoodUtil(robinhood);
        if (argv.prod) {
            const isMarketOpen = await robinhoodUtil.isMarketOpen();
            if (!isMarketOpen) {
                console.log('Market is not open... Exiting');
                return;
            }
            await Canceller.cancel(robinhood);
        }

        const stocksSoldToday = await this.getStocksSoldOnDate(robinhood, dateUtil.today);
        console.log(`Stocks to buy: ${JSON.stringify(stocksToBuy)}`);
        const quoteDatas = (await robinhood.quote_data(stocksToBuy.map(s => s.symbol).join(','))).results.filter(q => !!q);
        this.inflatePrices(stocksToBuy, quoteDatas);

        const moneyToSpend = await PurchaseAllocator.determineMoneyToSpend(robinhood, stocksToBuy.length);
        console.log('Getting positions...');
        const positions = await robinhoodUtil.getAllPositionsInflated();
        console.log(`Positions: ${positions.length}. Getting current money`);
        const currentMoney = await robinhoodUtil.getCurrentMoney(robinhood);
        console.log(`Current Money: ${currentMoney}. Inflating stock counts`);
        this.inflateCounts(stocksToBuy, moneyToSpend, currentMoney, positions, stocksSoldToday);
        console.log('Inflated... Buying now.');
        await this.buyStocks(robinhood, stocksToBuy);
    }

    inflatePrices(meta: SymbolTradeMeta[], quoteDataResults: QuoteDataResult[]): void {
        meta.forEach(m => {
            const quoteDataResult = quoteDataResults.find(q => q.symbol === m.symbol);
            if (quoteDataResult) {
                m.price = parseFloat(quoteDataResult.last_trade_price);
            }
        });
    }

    inflateCounts(meta: SymbolTradeMeta[], moneyToSpend: number, totalValue: number, ownedPositions: Position[] = [], stocksSoldToday: string[]) {
        meta = meta
            .filter(p => stocksSoldToday.indexOf(p.symbol) === -1)
            .filter((_, i) => i < variables.topNumToBuy);

        if (meta.length === 0) {
            return;
        }
        const topNum = Math.max(variables.minStocksForBuying, meta.length);
        const maxMoneyToSpendOnStock = totalValue / topNum;
        const stocksNotOwnedYet: SymbolTradeMeta[] = [];
        let currentPower = moneyToSpend;
        console.log('Setting initial counts...');
        meta.filter(p => p.price > 0).forEach((p) => {
            const price = p.price;
            console.log(`Setting counts for  ${p.symbol}: ${p.price}`);
            const moneyToSpendOnStock = Math.min(maxMoneyToSpendOnStock, currentPower);
            // console.log(`Money to spend on ` + p.symbol + ': $' + moneyToSpendOnStock, 'Last Trade Price: ' + p.lastTradePrice);
            const ownedPosition = ownedPositions.find(po => po.symbol === p.symbol);
            let moneySpentOnStock = ownedPosition ? ownedPosition.averageBuyPrice * ownedPosition.quantity : 0;
            if (!ownedPosition) {
                stocksNotOwnedYet.push(p);
            }

            while (currentPower > price && (moneyToSpendOnStock > moneySpentOnStock + price)) {
                p.count++;
                currentPower -= price;
                moneySpentOnStock += price;
            }
        });

        console.log('Dropping extra money');

        // Drop extra money, up to amount to spend on a single stock, on stocks not owned
        currentPower = Math.min(currentPower, maxMoneyToSpendOnStock)
        const smallestTradePrice = Math.min(...stocksNotOwnedYet.map(p => p.price));
        let chunkSize = 100;
        let its = 0;
        const maxIts = 10000;
        while (currentPower > smallestTradePrice && its < maxIts) {
            its++;
            stocksNotOwnedYet.forEach((p) => {
                if (currentPower > p.price && p.price > chunkSize) {
                    p.count++;
                    currentPower -= p.price;
                }
            });
            chunkSize = chunkSize / 2;
        }
    }
}