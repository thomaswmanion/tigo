import S3 from 'aws-sdk/clients/s3';
import { get } from 'request-promise-native';

import { NasdaqRating } from './nasdaq-rating.model';
import { symbolUtil } from '../util/symbol.util';
import { dateUtil } from './../util/date.util';
import getPixels from 'get-pixels';
import * as tmp from 'tmp';
import { execSync } from 'child_process';

const s3 = new S3();
export class NasdaqRatingUtil {

  async download(): Promise<void> {
    const symbols = await symbolUtil.getAllSymbols();
    const pops: NasdaqRating[] = [];
    let i = 0;
    for (const symbol of symbols) {
      i++;
      console.log(symbol, i);
      try {
        const pop = await this.downloadSymbol(symbol);
        console.log(pop.fraction);
        pops.push(pop);
        if (pops.length % 100 === 0 || i === symbols.length) {
          console.log(`Collected ${pops.length} pops. Tried ${i}/${symbols.length} symbols.`); ``
        }
      } catch (e) { }
    }
    await NasdaqRating.save(dateUtil.today, pops);
    console.log(`Saved ${pops.length} nasdaq ratings!`);
    const Key = dateUtil.formatDate(dateUtil.today) + '.json';
    const Bucket = `tempest-artifacts/nasdaq-rating`;
    const Body = JSON.stringify(pops);
    await s3.putObject({ Key, Bucket, Body }).promise();
  }

  async downloadSymbol(symbol: string): Promise<NasdaqRating> {
    const filename = this.downloadImage(symbol);
    const location = await this.getLocation(filename);
    const rating = new NasdaqRating(symbol, location);
    return rating;
  }

  downloadImage(symbol: string): string {
    const tmpFile = tmp.fileSync({ postfix: '.jpeg' });
    const url = `https://www.nasdaq.com/charts/${symbol}_rm.jpeg`;
    execSync(`curl -s ${url} > ${tmpFile.name}`);
    return tmpFile.name;
  }

  getLocation(file: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      getPixels(file, (err, pixels) => {
        if (err) {
          return reject(err);
        }
        const p = pixels.shape.slice();
        const width = p[0];
        const start = 15;

        for (let i = start; i < width; i++) {
          const p = this.getPoint(pixels.data, i, 70, width);
          if (this.isBasicallyWhite(p)) {
            const pos = (i - start) / (width - start);
            return resolve(pos);
          }
        }
        return resolve(0);
      });
    });
  }

  isBasicallyWhite(p: Point): boolean {
    return p.r >= 240 && p.g >= 240 && p.b >= 240;
  }

  getPoint(pixels, x: number, y: number, width: number): Point {
    const index = (x * 4) + ((width * 4) * y);
    return {
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2]
    }
  }
}
export const nasdaqRatingUtil = new NasdaqRatingUtil();

interface Point {
  r: number;
  g: number;
  b: number;
}
