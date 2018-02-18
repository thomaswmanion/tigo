import { PriceSnapshot } from './price-snapshot.model';
import { fileUtil } from './../util/file.util';
import { dateUtil } from './../util/date.util';
import { Robinhood } from '../robinhood/robinhood.api';
import { chunk } from 'lodash';
import S3 from 'aws-sdk/clients/s3';

const s3 = new S3();

export class PriceDownloaderService {
  constructor(
    public robinhood: Robinhood
  ) { }
  async downloadForSymbols(symbols: string[]): Promise<{ symbol: string, price: number }[]> {
    try {
      console.log('Requesting prices for ' + symbols.length + ' symbols.');
      const prices = await this.getPriceForSymbols(symbols);
      console.log(`Got ${prices.length} prices`);
      const Key = dateUtil.formatDate(dateUtil.today) + '.csv';
      const Bucket = `tempest-artifacts/price-snapshots`;
      const Body = prices.map(i => {
        return [i.symbol, i.price].join(',');
      }).join('\n') + '\n';
      await fileUtil.saveObject(PriceSnapshot.dir, Key, Body);
      await s3.putObject({ Key, Bucket, Body }).promise();
      return prices;
    }
    catch (e) {
      console.log(e);
    }
    return [];
  }

  async getPriceForSymbols(symbols: string[]): Promise<{ symbol: string, price: number }[]> {
    const chunkSize = 300 + Math.ceil(Math.random() * 300);
    const chunks: string[][] = chunk(symbols, chunkSize);
    const prices: { symbol: string, price: number }[] = [];
    await Promise.all(chunks.map(async chunk => {
      const p = await this.robinhood.getPricesForSymbols(chunk);
      prices.push(...p);
    }));
    return prices;
  }
}
