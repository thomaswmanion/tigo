import { symbolUtil } from '../../util/symbol.util';
import { PriceDownloaderService } from '../../pricing/price-downloader.service';
import { Robinhood } from '../../robinhood/robinhood.api';
import { variables } from '../../variables';

export async function run() {
  const robinhood = new Robinhood();
  const service = new PriceDownloaderService(robinhood);
  variables.useSymbolSubset = false;
  const symbols = await symbolUtil.getAllSymbols();
  await service.downloadForSymbols(symbols);
}
run().catch(e => {
  console.error(e);
  process.exit(1);
});
