import { Popularity } from './popularity.model';
import { Indicator } from '../indicators/indicator.model';
import { indicatorUtil } from './../indicators/indicator.util';
import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { variables } from '../variables';

export class PopularityIndicator {
  async createPopularityIndicatorsForDate(date: Date) {
    console.log(`Creating popularity indicators for ${dateUtil.formatDate(date)}.`);
    const indicators: Indicator[] = [];
    try {
      const pops = await Popularity.read(dateUtil.getPreviousWorkDay(date));
      pops.filter(p => p.numBuyRatings > 0).forEach(pop => {
        const i = new Indicator(pop.symbol);
        i.value = pop.getValue();
        indicators.push(i);
      });
    } catch (e) {

    }

    if (indicators.length > 0) {
      indicatorUtil.normalizeIndicators(indicators, variables.volatilityWeight);
      await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.popularity.json`, indicators);
      console.log(`Created ${indicators.length} popularity indicators for ${dateUtil.formatDate(date)}!`);
    }
  }
}