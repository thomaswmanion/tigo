import { PriceChange } from '../pricing/price-change.model';
import { indicatorUtil } from '../indicators/indicator.util';
import { fileUtil } from '../util/file.util';
import { Indicator } from '../indicators/indicator.model';
import { dateUtil } from '../util/date.util';
import { symbolUtil } from '../util/symbol.util';
import { variables } from '../variables';

export class VolatilityIndicator {
  async createVolatilityIndicatorsForDate(date: Date) {
    console.log(`Creating volatility indicators for ${dateUtil.formatDate(date)}.`);
    const indicators: Indicator[] = (await symbolUtil.getSymbols()).map(s => new Indicator(s));
    let curDate = date;
    const previousChanges: PriceChange[][] = [];
    for (let i = 0; i < variables.numPrevousVolatilitySteps; i++) {
      try {
        const changes = await PriceChange.createPreviousNDays(curDate, 1);
        previousChanges.push(changes);
      } catch (e) {

      }
      curDate = dateUtil.getPreviousWorkDay(curDate);
    }

    for (const indicator of indicators) {
      try {
        const symbolChanges: PriceChange[] = previousChanges
          .map(c => c.find(i => i.symbol === indicator.symbol))
          .filter(i => i !== undefined) as PriceChange[];
        // Picked Mean: 1.449% - All Median: 0.459% - Above: 14 - Below: 4 - Good Picks Percent: 77.78% - Yearly Value: 1.821]
        const v = symbolChanges.map(c => Math.abs(c.change)).reduce((a, b) => (a + b), 0);
        if (v) {
          indicator.value = v;
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
