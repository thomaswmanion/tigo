import { Indicator } from '../indicators/indicator.model';
import { indicatorUtil } from './../indicators/indicator.util';
import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { variables } from '../variables';
import { relativeStrengthUtil } from './relative-strength.util';

export class RelativeStrengthIndicator {
  async createIndicatorsForDate(date: Date) {
    const start = Date.now();
    console.log(`Creating relative strength indicators for ${dateUtil.formatDate(date)}.`);
    const map = await relativeStrengthUtil.getStockPriceListMap(date);
    const indicators = relativeStrengthUtil.convertStockPriceListMapToIndicators(map);

    if (indicators.length > 0) {
      indicatorUtil.normalizeIndicators(indicators, variables.relativeStrengthWeight);
      await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.relative-strength.json`, indicators);
      const runtime = Date.now() - start;
      console.log(`Created ${indicators.length} relative strength indicators for ${dateUtil.formatDate(date)}! Runtime: ${runtime}ms`);
    }
  }
}