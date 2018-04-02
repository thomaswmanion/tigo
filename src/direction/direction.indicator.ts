import { PriceChange } from './../pricing/price-change.model';
import { fileUtil } from '../util/file.util';
import { Indicator } from '../indicators/indicator.model';
import { dateUtil } from '../util/date.util';
import { symbolUtil } from '../util/symbol.util';

export class DirectionIndicator {
  async createDirectionIndicatorsForDate(date: Date) {
    const changes = await PriceChange.createPrevious(date);
    console.log(`Creating direction indicators for ${dateUtil.formatDate(date)}.`);
    const indicators: Indicator[] = (await symbolUtil.getSymbols()).map(s => new Indicator(s));
    for (const indicator of indicators) {
      try {
        const c = changes.find(c => c.symbol === indicator.symbol);
        if (c && c.change >= 0) {
          indicator.value = 1;
        } else {
          indicator.value = 0;
        }
      } catch (e) {

      }
    }

    await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.direction.json`, indicators);
    console.log(`Created ${indicators.length} indicators for ${dateUtil.formatDate(date)}!`);
  }

  isInRange(num: number, low: number, high: number): boolean {
    return (num >= low) && (num <= high);
  }
}