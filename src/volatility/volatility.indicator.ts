import { indicatorUtil } from './../indicators/indicator.util';
import { ruleUtil } from './../rule/rule.util';
import { fileUtil } from '../util/file.util';
import { Indicator } from '../indicators/indicator.model';
import { dateUtil } from '../util/date.util';
import { symbolUtil } from '../util/symbol.util';
import { PriceChange } from '../pricing/price-change.model';
import { variables } from '../variables';

export class VolatilityIndicator {
  async createVolatilityIndicatorsForDate(date: Date) {
    console.log(`Creating volatility indicators for ${dateUtil.formatDate(date)}.`);
    const rules = await ruleUtil.createRulesForDate(date);

    const day = await PriceChange.createPreviousNDays(date, 1);
    const week = await PriceChange.createPreviousNDays(date, 5);
    const month = await PriceChange.createPreviousNDays(date, 20);
    const quarter = await PriceChange.createPreviousNDays(date, 60);
    // const future = await PriceChange.createFuture(date);
    const indicators: Indicator[] = (await symbolUtil.getSymbols()).map(s => new Indicator(s));
    for (const indicator of indicators) {
      try {
        const d = day.find(i => i.symbol === indicator.symbol);
        const w = week.find(i => i.symbol === indicator.symbol);
        const m = month.find(i => i.symbol === indicator.symbol);
        const q = quarter.find(i => i.symbol === indicator.symbol);
        // const f = future.find(i => i.symbol === indicator.symbol);
        if (d && w && m && q) {
          indicator.value = ruleUtil.findMatchingRuleValue(rules, d.change, w.change, m.change, q.change);
        }
      } catch (e) {

      }
    }
    indicatorUtil.normalizeIndicators(indicators, variables.volatilityWeight);

    await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.volatility.json`, indicators);
    console.log(`Created ${indicators.length} indicators for ${dateUtil.formatDate(date)}!`);
  }

  isInRange(num: number, low: number, high: number): boolean {
    return (num >= low) && (num <= high);
  }
}
