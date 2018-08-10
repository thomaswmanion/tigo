import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { wprUtil } from './wpr.util';
import { relativeStrengthUtil } from '../relative-strength/relative-strength.util';
import { variables } from '../variables';
import { indicatorUtil } from '../indicators/indicator.util';
import { Indicator } from '../indicators/indicator.model';


export class WprIndicator {
    type: string = 'wpr';
    async createIndicatorsForDate(date: Date) {
        const start = Date.now();
        console.log(`Creating ${this.type} indicators for ${dateUtil.formatDate(date)}.`);
        const map = await relativeStrengthUtil.getStockPriceListMap(date, variables.wprRangeSize);
        const indicators = wprUtil.convertStockPriceListMapToIndicators(map);

        if (indicators.length > 0) {
            indicatorUtil.normalizeIndicators(indicators, variables.wprWeight, true);
            await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.${this.type}.json`, indicators);
            const runtime = Date.now() - start;
            console.log(`Created ${indicators.length} ${this.type} indicators for ${dateUtil.formatDate(date)}! Runtime: ${runtime}ms`);
        }
    }
}
