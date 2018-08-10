import { dateUtil } from '../util/date.util';
import { PriceSnapshot } from './../pricing/price-snapshot.model';
import { RSI } from 'technicalindicators';
import { variables } from '../variables';
import { Indicator } from '../indicators/indicator.model';

class RelativeStrengthUtil {
  async getStockPriceListMap(date: Date, steps = variables.numPrevousVolatilitySteps): Promise<Map<string, number[]>> {
    let curDate = date;
    const map = new Map<string, number[]>();
    for (let i = 0; i < steps; i++) {
      try {
        const snaps = await PriceSnapshot.readForDate(curDate);
        snaps.forEach(snap => {
          const arr = map.get(snap.symbol);
          if (arr) {
            arr.push(snap.price);
          } else {
            map.set(snap.symbol, [snap.price]);
          }
        });

      } catch (e) {

      }
      curDate = dateUtil.getPreviousWorkDay(curDate);
    }
    return map;
  }
  convertStockPriceListMapToIndicators(map: Map<string, number[]>): Indicator[] {
    const indicators: Indicator[] = [];
    map.forEach((values, symbol) => {
      const rsi = this.getRsi(values);
      // console.log(rsi);
      if (rsi) {
        const i = new Indicator(symbol);
        i.value = rsi;
        indicators.push(i);
      }
    });
    return indicators;
  }
  getRsi(values: number[]): number {
    var inputRSI = { values, period: values.length - 1 };
    return RSI.calculate(inputRSI)[0];
  }
}
export const relativeStrengthUtil = new RelativeStrengthUtil();
