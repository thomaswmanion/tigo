import { mapUtil } from './../util/map.util';
import { PriceChange } from '../pricing/price-change.model';
import { indicatorUtil } from '../indicators/indicator.util';
import { fileUtil } from '../util/file.util';
import { Indicator } from '../indicators/indicator.model';
import { dateUtil } from '../util/date.util';
import { symbolUtil } from '../util/symbol.util';
import { variables } from '../variables';

export class VolatilityIndicator {
  async createVolatilityIndicatorsForDate(date: Date) {
    const start = Date.now();
    console.log(`Creating volatility indicators for ${dateUtil.formatDate(date)}.`);
    const symbols: string[] = await symbolUtil.getAllSymbols();
    let curDate = date;
    const previousChanges: Map<string, PriceChange>[] = [];
    const indicators: Indicator[] = [];
    for (let i = 0; i < variables.numPrevousVolatilitySteps; i++) {
      try {
        const changes = await PriceChange.createPreviousNDays(curDate, 1);
        const map = mapUtil.convertArrayToSymbolMap(changes);
        previousChanges.push(map);
      } catch (e) {

      }
      curDate = dateUtil.getPreviousWorkDay(curDate);
    }

    for (const symbol of symbols) {
      try {
        const symbolChanges: PriceChange[] = previousChanges
          .map(c => c.get(symbol))
          .filter(i => i !== undefined) as PriceChange[];
        // Picked Mean: 1.449% - All Median: 0.459% - Above: 14 - Below: 4 - Good Picks Percent: 77.78% - Yearly Value: 1.821]
        const v = symbolChanges.map(c => Math.abs(c.change)).reduce((a, b) => (a + b), 0);
        // const half = Math.floor(symbolChanges.length / 2);
        // const firstChange = symbolChanges.filter((_, i) => i <= half).map(c => c.change).reduce((a, b) => (a + b), 0);
        // const secondChange = symbolChanges.filter((_, i) => i > half).map(c => c.change).reduce((a, b) => (a + b), 0);
        // const volatility = symbolChanges.map(c => Math.abs(c.change)).reduce((a, b) => (a + b), 0);
        // const v = (secondChange - firstChange) + volatility;
        if (v && !isNaN(v)) {
          const indicator = new Indicator(symbol);
          indicator.value = v;
          indicators.push(indicator);
        }
      } catch (e) {

      }
    }
    if (indicators.length) {
      indicatorUtil.normalizeIndicators(indicators, variables.volatilityWeight, true);

      await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.volatility.json`, indicators);
      const runtime = Date.now() - start;
      console.log(`Created ${indicators.length} indicators for ${dateUtil.formatDate(date)}! Runtime: ${runtime}ms`);
    }
  }

  isInRange(num: number, low: number, high: number): boolean {
    return (num >= low) && (num <= high);
  }
}
