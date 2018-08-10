import { Calculator } from './../util/calculator.util';
import { WilliamsR } from 'technicalindicators';
import { Indicator } from '../indicators/indicator.model';
import { variables } from '../variables';

class WprUtil {
    getWpr(high: number[], low: number[], values: number[]): number {
        const result = WilliamsR.calculate({
            high,
            low,
            close: values,
            period: variables.wprStepSize,
        }).filter(r => r && !isNaN(r));
        if (result.length) {
            // const res = result[result.length - 1];

            // const res = result[0]; //BEST 1.383
            // const res = result[0] - result[result.length - 1]; // 1.392
            // 1.443
            const res = result[result.length - 1] + Calculator.change(result[result.length - 1], result[0]);
            // console.log('res', res);
            // console.log(res);
            return res;
        }
        return 0;
    }

    convertStockPriceListMapToIndicators(map: Map<string, number[]>): Indicator[] {
        const indicators: Indicator[] = [];

        map.forEach((values, symbol) => {
            let subValues: number[] = [];
            const close: number[] = [];
            const high: number[] = [];
            const low: number[] = [];
            for (let i = 0; i < values.length; i++) {
                subValues.push(values[i]);
                if (subValues.length === variables.wprStepSize) {
                    const c = values[i];
                    const h = Math.max(...subValues);
                    const l = Math.min(...subValues);
                    // console.log(c,h,l);
                    close.push(c);
                    high.push(h);
                    low.push(l);
                    subValues.shift();
                }
            }
            const v = this.getWpr(high, low, close);
            if (v && !isNaN(v)) {
                const i = new Indicator(symbol);
                i.value = v;
                // console.log(symbol, v);
                indicators.push(i);
            }
        });
        return indicators;
    }
}

export const wprUtil = new WprUtil();
