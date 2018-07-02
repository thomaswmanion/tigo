import { symbolUtil } from './../util/symbol.util';
import { dateUtil } from './../util/date.util';
import request from 'request-promise-native';
import { Zachs } from './zachs.model';

import S3 from 'aws-sdk/clients/s3';

const s3 = new S3();
export class ZachsUtil {
  async download(): Promise<void> {
    const symbols = await symbolUtil.getAllSymbols();
    const zachsz: Zachs[] = [];
    let i = 0;
    for (const symbol of symbols) {
      i++;
      console.log(`Zachs ${i} of ${symbols.length} - ${symbol}. ${zachsz.length} collected.`);
      try {
        
        const page = await this.downloadPage(symbol);
        const z = await this.determineValue(symbol, page);
        if (z.rating) {
          zachsz.push(z);
        }
      } catch (e) {

      }
    }
    await Zachs.save(dateUtil.today, zachsz);
    console.log(`Saved ${zachsz.length} zachs ratings!`);
    const Key = dateUtil.formatDate(dateUtil.today) + '.json';
    const Bucket = `tempest-artifacts/zachs`;
    const Body = JSON.stringify(zachsz);
    await s3.putObject({ Key, Bucket, Body }).promise();
  }
  downloadPage(symbol: string): Promise<string> {
    const url = `https://www.zacks.com/stock/chart/${symbol}/broker-recommendations`;
    return request.get(url, {
      json: false
    }).promise();
  }

  async determineValue(symbol: string, page: string): Promise<Zachs> {
    let rating = 3;
    if (page.indexOf('1-Strong Buy') !== -1) {
      rating = 5;
    } else if (page.indexOf('2-Buy') !== -1) {
      rating = 4;
    } else if (page.indexOf('4-Sell') !== -1) {
      rating = 2;
    } else if (page.indexOf('5-Strong Sell') !== -1) {
      rating = 1;
    }
    page = page.replace(/\s/g, '').toLowerCase();
    let part = this.between(page, 'class="status">', '</a>');
    part = this.between(part, '(', ')');
    part = part.replace('outof', '-');
    const parts = part.split('-');
    const rank = parseFloat(parts[0]);
    const total = parseFloat(parts[1]);

    return new Zachs(symbol, rating, rank, total);
  }

  between(string: string, start: string, finish?: string): string {
    var sub = string.substring(string.indexOf(start) + start.length);
    if (finish) {
      sub = sub.substring(0, sub.indexOf(finish));
    }
    return sub;
  }
}
export const zachsUtil = new ZachsUtil();

interface MiddleResponse {
  symbol: string;
  info: Zachs;
}