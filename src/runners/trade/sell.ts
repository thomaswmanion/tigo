import { Seller } from '../../robinhood/sell/seller';

async function run() {
  const seller = new Seller();
  await seller.runSell();
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
