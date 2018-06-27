import { NasdaqRating } from './nasdaq-rating.model';
import { Indicator } from '../indicators/indicator.model';
import { indicatorUtil } from './../indicators/indicator.util';
import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { variables } from '../variables';

export class NasdaqRatingIndicator {
  async createNasdaqRatingIndicatorsForDate(date: Date) {
    console.log(`Creating nasdaq-rating indicators for ${dateUtil.formatDate(date)}.`);
    const indicators: Indicator[] = [];
    try {
      const nrs = await NasdaqRating.read(dateUtil.getPreviousWorkDay(date));
      nrs.forEach(nr => {
        const i = new Indicator(nr.symbol);
        i.value = nr.fraction;
        indicators.push(i);
      });
    } catch (e) {

    }

    if (indicators.length > 0) {
      indicatorUtil.normalizeIndicators(indicators, variables.nasdaqRatingWeight);
      await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.nasdaq-rating.json`, indicators);
      console.log(`Created ${indicators.length} nasdaq-rating indicators for ${dateUtil.formatDate(date)}!`);
    }
  }
}