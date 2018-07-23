import { Calculator } from './../util/calculator.util';
import { PriceChange } from './../pricing/price-change.model';
import { fileUtil } from '../util/file.util';
import { Indicator } from '../indicators/indicator.model';
import { dateUtil } from '../util/date.util';
import { symbolUtil } from '../util/symbol.util';
import { variables } from '../variables';
import { indicatorUtil } from '../indicators/indicator.util';

export class DirectionIndicator {
  async createDirectionIndicatorsForDate(date: Date) {
    const start = Date.now();
    console.log(`Creating direction indicators for ${dateUtil.formatDate(date)}.`);
    const indicators: Indicator[] = [];
    const industries = symbolUtil.getCurrentIndustries();
    for (const industry of industries) {
      try {
        const symbols = await symbolUtil.getSymbols(industry);
        const changes = await PriceChange.createPreviousNDays(date, variables.numPredictedDays);
        const industryChanges = changes.filter(c => symbols.indexOf(c.symbol) !== -1);
        const industryMedian = Calculator.findMedian(industryChanges.map(c => c.change));
        if (industryMedian && !isNaN(industryMedian)) {
          const is = symbols.map(s => new Indicator(s));
          
          is.forEach(i => {
            i.value = industryMedian;
          });
          indicators.push(...is);
        }
      } catch (e) {

      }
      
    }
    
    indicatorUtil.normalizeIndicators(indicators, variables.directionWeight);
    await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.direction.json`, indicators);
    const runtime = Date.now() - start;
    console.log(`Created ${indicators.length} indicators for ${dateUtil.formatDate(date)}! Runtime: ${runtime}ms`);
  }

  isInRange(num: number, low: number, high: number): boolean {
    return (num >= low) && (num <= high);
  }
}