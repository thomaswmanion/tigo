import { Calculator } from '../../util/calculator.util';
import { PriceSnapshot } from '../../pricing/price-snapshot.model';
import { dateUtil } from '../../util/date.util';
import { StockDirection } from './stock-direction.model';
import { symbolUtil } from '../../util/symbol.util';
import { variables } from '../../variables';
import { PriceChange } from '../../pricing/price-change.model';
import { fileUtil } from '../../util/file.util';
import * as path from 'path';

export class StockPickerUtil {
  static async pickStocksForDatePrev(date: Date): Promise<string[]> {
    const endDate = date;
    const allSymbols = await symbolUtil.getAllHealthcareSymbols();
    let stockDirections = allSymbols.map(s => new StockDirection(s));
    let curDate = dateUtil.getDaysAgo(variables.stockPickRange, date);
    while (curDate < endDate) {
      try {
        const changes = await PriceChange.createPrevious(curDate);
        for (const change of changes) {
          const stockDirection = stockDirections.find(sd => sd.symbol === change.symbol);
          if (stockDirection) {
            if (change.change > 0) {
              stockDirection.increase++;
            } else if (change.change < 0) {
              stockDirection.decrease++;
            }
          }
        }
      } catch (e) { }

      curDate = dateUtil.getNextWorkDay(curDate);
    }
    stockDirections = stockDirections
      .filter(s => s.hasMinimum())
      .sort((a, b) => b.getIncreaseFraction() - a.getIncreaseFraction())
      .filter((_, i) => i < variables.numSymbolsToCompare);

    const symbols = stockDirections.map(s => s.symbol);
    await fileUtil.saveObject('.', 'symbols.json', symbols);
    return symbols;
  }

  static async pickStocksForDate(date: Date): Promise<void> {
    const industryFilepaths = await symbolUtil.getIndustryFilepaths();
    const industryMedians = await this.findMedianPerIndustry(industryFilepaths, date);
    if (industryMedians.length > 0) {
      industryMedians.sort((a, b) => b.median - a.median);
      industryMedians.forEach(m => {
        const medianPercent = (m.median * 100).toFixed(3) + '%';
        console.log(`${m.industry} - ${medianPercent}`);
      });
      const industry = industryMedians[0].industry;
      await fileUtil.saveObject('.', `industry.json`, industry);
    } else {
      console.error('No stock spicked.');
    }

  }

  static async findMedianPerIndustry(industryFilepaths: string[], date: Date): Promise<IndustryMedian[]> {
    const industryMedians: IndustryMedian[] = [];
    for (const file of industryFilepaths) {
      try {
        const industry = file.replace('.json', '');
        const median = await this.findMedianForIndustry(file, date);
        if (median) {
          industryMedians.push({ industry: path.posix.basename(industry), median });
        }
      } catch (e) { }

    }
    return industryMedians;
  }

  static async findMedianForIndustry(industryFilepath: string, date: Date): Promise<number | undefined> {
    const prevDate = await dateUtil.getDaysAgo(variables.stockPickRange, date);
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
  median: number;
}