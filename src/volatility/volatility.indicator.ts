import { fileUtil } from '../util/file.util';
import { Indicator } from '../indicators/indicator.model';
import { dateUtil } from '../util/date.util';
import { symbolUtil } from '../util/symbol.util';
import { PriceChange } from '../pricing/price-change.model';

export class VolatilityIndicator {
  async createVolatilityIndicatorsForDate(date: Date) {
    console.log(`Creating volatility indicators for ${dateUtil.formatDate(date)}.`);

    const last1 = await PriceChange.createPreviousNDays(date, 1);
    const last2 = await PriceChange.createPreviousNDays(date, 6);
    const last3 = await PriceChange.createPreviousNDays(date, 15);
    const last4 = await PriceChange.createPreviousNDays(date, 30);
    const indicators: Indicator[] = (await symbolUtil.getSymbols()).map(s => new Indicator(s));
    for (const indicator of indicators) {
      try {
        const l1 = last1.find(i => i.symbol === indicator.symbol);
        const l2 = last2.find(i => i.symbol === indicator.symbol);
        const l3 = last3.find(i => i.symbol === indicator.symbol);
        const l4 = last4.find(i => i.symbol === indicator.symbol);
        let value = 0;
        if (l1 && l1.change > 0) {
          value += 0.125 + (l1.change / 1000)
          if (l1.change > 0.003 && l1.change < 0.1) {
            value += 0.125;
          }
        }
        if (l2 && l2.change > 0) {
          value += 0.125 + (l2.change / 1000)
          if (l2.change > 0.003 && l2.change < 0.1) {
            value += 0.125;
          }
        }
        if (l3 && l3.change > 0) {
          value += 0.125 + (l3.change / 1000)
          if (l3.change > 0.05) {
            value += 0.125;
          }
        }
        if (l4 && l4.change > 0) {
          value += 0.125 + (l4.change / 1000);
          if (l4.change > 0.05) {
            value += 0.125;
          }
        }
        indicator.value = value;
      } catch (e) {

      }
    }

    await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.volatility.json`, indicators);
    console.log(`Created ${indicators.length} indicators for ${dateUtil.formatDate(date)}!`);
  }

  isInRange(num: number, low: number, high: number): boolean {
    return (num >= low) && (num <= high);
  }
}