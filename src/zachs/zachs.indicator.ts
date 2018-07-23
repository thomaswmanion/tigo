import { Zachs } from './zachs.model';
import { Indicator } from '../indicators/indicator.model';
import { indicatorUtil } from './../indicators/indicator.util';
import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { variables } from '../variables';

export class ZachsIndicator {
  async createZachsIndicatorsForDate(date: Date) {
    console.log(`Creating zachs indicators for ${dateUtil.formatDate(date)}.`);
    const indicators: Indicator[] = [];
    try {
      const zachz = await Zachs.read(dateUtil.getPreviousWorkDay(date));
      zachz.forEach(z => {
        const i = new Indicator(z.symbol);
        i.value = z.rating;
        const bonus = (z.total - z.rank) / z.total; //percent above
        // console.log(JSON.stringify(z));
        if (!isNaN(bonus)) {
          i.value += (bonus * variables.zachsBonusWeight);
        }
        indicators.push(i);
      });
    } catch (e) {

    }

    if (indicators.length > 0) {
      indicatorUtil.normalizeIndicators(indicators, variables.zachsRatingWeight);
      await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.zachs.json`, indicators);
      console.log(`Created ${indicators.length} zachs indicators for ${dateUtil.formatDate(date)}!`);
    }
  }
}