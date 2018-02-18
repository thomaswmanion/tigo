import { symbolUtil } from './../../util/symbol.util';
import { PriceDownloaderService } from '../../pricing/price-downloader.service';
import { Robinhood } from '../../robinhood/robinhood.api';

export async function run() {
  const robinhood = new Robinhood();
  const service = new PriceDownloaderService(robinhood);
  const symbols = await symbolUtil.getAllSymbols();
  await service.downloadForSymbols(symbols);
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
