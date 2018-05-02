import S3 from 'aws-sdk/clients/s3';
import { dateUtil } from './../util/date.util';
import { symbolUtil } from "../util/symbol.util";
import { Popularity } from "./popularity.model";
import { Robinhood } from "../robinhood/robinhood.api";

const s3 = new S3();

export class PopularityUtil {

  async download(): Promise<void> {
    const symbols = await symbolUtil.getAllSymbols();
    const pops: Popularity[] = [];
    for (const symbol of symbols) {
      try {
        const pop = await this.downloadSymbol(symbol);
        pops.push(pop);
        if (pops.length % 100 === 0) {
          console.log(`Collected ${pops.length} pops...`); ``
        }
      } catch (e) { }
    }
    await Popularity.save(dateUtil.today, pops);
    console.log(`Saved ${pops.length} pops!`);
    const Key = dateUtil.formatDate(dateUtil.today) + '.json';
    const Bucket = `tempest-artifacts/popularity`;
    const Body = JSON.stringify(pops);
    await s3.putObject({ Key, Bucket, Body }).promise();
  }

  async downloadSymbol(symbol: string): Promise<Popularity> {
    const r = new Robinhood();
    const quoteDataResponse = await r.quote_data(symbol);
    const quoteData = r.getCorrectForSymbol(symbol, quoteDataResponse.results);
    if (quoteData.instrument) {
      const id = this.getIdFromInstrumentUrl(quoteData.instrument);
      const res = await r.get(`https://api.robinhood.com/midlands/ratings/${id}/`);
      const s = res.summary;
      return new Popularity(symbol, s.num_buy_ratings, s.num_hold_ratings, s.num_sell_ratings);
    }
    throw new Error('No instrument found for ' + symbol);
  }

  getIdFromInstrumentUrl(instrumentUrl: string): string {
    return instrumentUrl.split('/')[4];
  }
}
export const popularityUtil = new PopularityUtil();
