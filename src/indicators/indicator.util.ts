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

  normalizeIndicators(indicators: Indicator[], weight: number = 1, filterOutExtremes?: boolean): void {
    const vals = indicators.map(i => i.value);
    const filtered = filterOutExtremes ? this.filterOutliers(vals) : vals;
    const min = Math.min(...filtered);
    const max = Math.max(...filtered);
    const diff = max - min;

    indicators.forEach(indicator => {
      const x = indicator.value;
      indicator.value = (x - min) / diff;
      if (indicator.value > 1 || indicator.value < 0) {
        // Set extreme values to 0...
        indicator.value = 0;
      }
      indicator.value = indicator.value * weight;
    });
  }

  filterOutliers(someArray: number[]): number[] {

    const values = someArray.concat();
    values.sort((a, b) => a - b);

    /* Then find a generous IQR. This is generous because if (values.length / 4) 
     * is not an int, then really you should average the two elements on either 
     * side to find q1.
     */
    const q1 = values[Math.floor((values.length / 4))];
    // Likewise for q3. 
    const q3 = values[Math.ceil((values.length * (3 / 4)))];
    const iqr = q3 - q1;

    // Then find min and max values
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    // Then filter anything beyond or beneath these values.
    const filteredValues = values.filter((x) => {
      return (x <= maxValue) && (x >= minValue);
    });

    return filteredValues;
  }
}
export const indicatorUtil = new IndicatorUtil();
