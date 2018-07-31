import { relativeStrengthUtil } from '../relative-strength/relative-strength.util';
import { kstUtil } from './kst.util';
import { Indicator } from '../indicators/indicator.model';
import { indicatorUtil } from './../indicators/indicator.util';
import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { variables } from '../variables';

export class KstIndicator {
  async createIndicatorsForDate(date: Date) {
    const start = Date.now();
    console.log(`Creating kst indicators for ${dateUtil.formatDate(date)}.`);
    const map = await relativeStrengthUtil.getStockPriceListMap(date, variables.numKstSteps);
    const indicators = kstUtil.convertStockPriceListMapToIndicators(map);

    if (indicators.length > 0) {
      indicatorUtil.normalizeIndicators(indicators, variables.kstWeight, true);
      await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.kst.json`, indicators);
      const runtime = Date.now() - start;
      console.log(`Created ${indicators.length} kst indicators for ${dateUtil.formatDate(date)}! Runtime: ${runtime}ms`);
    }
  }
}