import { KST } from 'technicalindicators';
import { Indicator } from '../indicators/indicator.model';

class KstUtil {
  getKst(values: number[]): number {
    const input = {
      values,
      ROCPer1: 10,
      ROCPer2: 13,
      ROCPer3: 15,
      ROCPer4: 20,
      SMAROCPer1: 10,
      SMAROCPer2: 13,
      SMAROCPer3: 15,
      SMAROCPer4: 20,
      signalPeriod: 9
    };
    const result = KST.calculate(input);
    if (result && result.length > 0 && result[0].kst) {
      return result[0].kst;
    } else {
      return 0;
    }
  }

  convertStockPriceListMapToIndicators(map: Map<string, number[]>): Indicator[] {
    const indicators: Indicator[] = [];
    map.forEach((values, symbol) => {
      const rsi = this.getKst(values);
      if (rsi) {
        const i = new Indicator(symbol);
        i.value = rsi;
        indicators.push(i);
      }
    });
    return indicators;
  }
}

export const kstUtil = new KstUtil();
