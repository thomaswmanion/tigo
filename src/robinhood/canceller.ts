import { Robinhood } from './robinhood.api';

export class Canceller {
    static async cancel(robinhood: Robinhood): Promise<void> {
        const orders = await robinhood.orders();
        const activeOrders = orders.results.filter(order => order.state !== 'cancelled' && order.state !== 'filled');
        if (activeOrders.length > 0) {
            const res = activeOrders.map(async function(activeOrder) {
                return await robinhood.cancel(activeOrder.id);
            });
            const results = await Promise.all(res);
            console.log(`Cancelled ${results.length} items`);
        }
        console.log('Completed cancelling');
    }
}
