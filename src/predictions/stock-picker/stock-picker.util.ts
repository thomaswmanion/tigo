import { printUtil } from './../../util/print.util';
import { Calculator } from '../../util/calculator.util';
import { PriceSnapshot } from '../../pricing/price-snapshot.model';
import { dateUtil } from '../../util/date.util';
import { symbolUtil } from '../../util/symbol.util';
import { variables } from '../../variables';
import { fileUtil } from '../../util/file.util';
import * as path from 'path';

export class StockPickerUtil {
  static async pickStocksForDate(date: Date): Promise<boolean> {
    const industryFilepaths = await symbolUtil.getIndustryFilepaths();
    const industryMedians = await this.findMediansPerIndustry(industryFilepaths, date);
    if (industryMedians.length > 0) {

      industryMedians.forEach(im => {
        let value = im.lastWeek / 100;
        if (im.lastDay > 0) {
          value += 0.25;
        }
        if (im.lastWeek > 0.01) {
          value += 0.25;
        }
        if (im.lastMonth > 0.03) {
          value += 0.25;
        }
        if (im.lastQuarter > 0.05) {
          value += 0.25;
        }
        im.value = value;
      });
      industryMedians.sort((a, b) => b.value - a.value);

      industryMedians.forEach(m => {
        const lastDay = printUtil.asPercent(m.lastDay);
        const lastWeek = printUtil.asPercent(m.lastWeek);
        const lastMonth = printUtil.asPercent(m.lastMonth);
        const lastQuarter = printUtil.asPercent(m.lastQuarter);
        const future = printUtil.asPercent(m.future * -1);
        console.log(`${m.industry} - Last Day: ${lastDay} - Last Week: ${lastWeek} - Last Month: ${lastMonth} - Last Quarter: ${lastQuarter} - Value: ${m.value} - Future: ${future}`);
      });

      const industries = industryMedians
        .filter((_, i) => i < variables.numTopIndustries)
        .map(i => i.industry);
      if (industries.length) {
        await fileUtil.saveObject('.', `industry.json`, industries);
        return true;
      } else {
        return false;
      }
    } else {
      console.error('No stocks picked.');
      return false;
    }
  }

  static async findMediansPerIndustry(industryFilepaths: string[], date: Date): Promise<IndustryMedian[]> {
    const industryMedians: IndustryMedian[] = [];
    for (const file of industryFilepaths) {
      try {
        const industry = file.replace('.json', '');
        const lastDay = await this.findMedianForIndustry(file, date, 1);
        const lastWeek = await this.findMedianForIndustry(file, date, 5);
        const lastMonth = await this.findMedianForIndustry(file, date, 20);
        const lastQuarter = await this.findMedianForIndustry(file, date, 60);
        const future = await this.findMedianForIndustry(file, date, -6);
        if (lastDay && lastWeek && lastMonth && lastQuarter && future) {
          industryMedians.push({
            industry: path.posix.basename(industry),
            lastDay,
            lastWeek,
            lastMonth,
            lastQuarter,
            future,
            value: 0
          });
        }
      } catch (e) { }

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
