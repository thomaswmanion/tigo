import { Robinhood } from '../robinhood.api';

export class PurchaseAllocator {
    static async determineMoneyToSpend(robinhood: Robinhood, numStocks: number): Promise<number> {
        const accounts = await robinhood.accounts();
        const account = accounts.results[0];
        const buyingPower: number = parseFloat(account.buying_power);
        let buyingPowerWithGold = buyingPower;
        if (account.margin_balances && account.margin_balances.unallocated_margin_cash) {
            const unallocatedMarginCash = parseFloat(account.margin_balances.unallocated_margin_cash);
            buyingPowerWithGold = Math.max(buyingPower, unallocatedMarginCash);
        }

        const portfolioBody = await robinhood.get(account.portfolio);

        const previousEquity = parseFloat(portfolioBody.last_core_equity);
        const equityOnStockCount = numStocks > 4 ? previousEquity : previousEquity / 4;
        const maxAmountOfMoneyToSpend = Math.max(0, Math.min(buyingPowerWithGold, equityOnStockCount)) * 0.95;
        console.log(`Previous Equity: ${previousEquity} - Max Amount of Money to Spend: ${maxAmountOfMoneyToSpend}`);
        console.log(`Amount of money to spend: $${maxAmountOfMoneyToSpend}`);
        return maxAmountOfMoneyToSpend;
    }
}
