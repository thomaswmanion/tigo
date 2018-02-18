import { dateUtil } from '../../util/date.util';
import { Buyer } from '../../robinhood/buy/buyer';

async function run() {
  const buyer = new Buyer();
  await buyer.runBuy(dateUtil.today);
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
