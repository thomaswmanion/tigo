import { fileUtil } from '../util/file.util';
import { dateUtil } from '../util/date.util';
import { Indicator } from './indicator.model';
class IndicatorUtil {
  async readAndSortIndicatorsForDateAndType(date: Date, type: string): Promise<Indicator[]> {
    const file = `${dateUtil.formatDate(date)}.${type}.json`;
    const arr = await fileUtil.readObject(Indicator.dir, file);
    const indicatorsUnsorted: Indicator[] = arr.map((i: Indicator) => {
      const indicator = new Indicator(i.symbol)
      indicator.value = i.value;
      return indicator;
    });
    return indicatorsUnsorted.sort((a, b) => b.value - a.value);
  }
}
export const indicatorUtil = new IndicatorUtil();
