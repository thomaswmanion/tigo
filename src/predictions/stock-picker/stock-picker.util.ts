import { Calculator } from '../../util/calculator.util';
import { PriceSnapshot } from '../../pricing/price-snapshot.model';
import { dateUtil } from '../../util/date.util';
import { fileUtil } from '../../util/file.util';
import * as path from 'path';

export class StockPickerUtil {

  static async findMediansPerIndustry(industryFilepaths: string[], date: Date): Promise<IndustryMedian[]> {
    const industryMedians: IndustryMedian[] = [];
    for (const file of industryFilepaths) {
      try {
        const industry = file.replace('.json', '');
        const lastDay = await this.findMedianForIndustry(file, date, 1);
        const lastWeek = await this.findMedianForIndustry(file, date, 5);
        const lastMonth = await this.findMedianForIndustry(file, date, 20);
        const lastQuarter = await this.findMedianForIndustry(file, date, 60);
        // const future = await this.findMedianForIndustry(file, date, -6);
        if (lastDay && lastWeek && lastMonth && lastQuarter) {
          industryMedians.push({
            industry: path.posix.basename(industry),
            lastDay,
            lastWeek,
            lastMonth,
            lastQuarter,
            future: 0,
            value: 0
          });
        }
      } catch (e) {
        console.log(e);
      }

    }
    return industryMedians;
  }

  static async findMedianForIndustry(industryFilepath: string, date: Date, numDays: number): Promise<number | undefined> {
    const prevDate = await dateUtil.getDaysAgo(numDays, date);
    const symbols: string[] = await fileUtil.readLocalObject(industryFilepath);
    const curAll = await PriceSnapshot.readNearDate(date);
    const prevAll = await PriceSnapshot.readNearDate(prevDate);
    const changes: number[] = [];
    for (const symbol of symbols) {
      const prev = prevAll.find(p => p.symbol === symbol);
      const cur = curAll.find(p => p.symbol === symbol);
      if (cur && prev) {
        const change = Calculator.change(cur.price, prev.price);
        changes.push(change);
      }
    }
    if (changes.length) {
      return Calculator.findMedian(changes);
    } else {
      return undefined;
    }
  }
}


interface IndustryMedian {
  industry: string;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  lastQuarter: number;
  future: number;
  value: number;
}
