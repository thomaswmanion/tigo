import { fileUtil } from '../util/file.util';
import { Calculator } from '../util/calculator.util';
import { Indicator } from '../indicators/indicator.model';
import { PriceChange } from '../pricing/price-change.model';
import { StockMap } from './stock-map.model';
import { variables } from '../variables';
import { dateUtil } from '../util/date.util';

export class HistoricalChangeUpdater {
  updateForSymbol(changes: PriceChange[], futureChange: PriceChange, stockMap: StockMap): void {
    const resultingChange = futureChange.change;

    for (const change of changes) {
      const comparison = stockMap.previousComparisons.find(p => p.stock === change.symbol);
      if (comparison) {
        comparison.previousDecreaseImpliedDecrease *= variables.deprecationAmount;
        comparison.previousDecreaseImpliedIncrease *= variables.deprecationAmount;
        comparison.previousIncreaseImpliedDecrease *= variables.deprecationAmount;
        comparison.previousIncreaseImpliedIncrease *= variables.deprecationAmount;

        const currentChange = change.change;
        if (resultingChange >= 0) {
          if (currentChange >= 0) {
            comparison.previousIncreaseImpliedIncrease++;
          } else {
            comparison.previousDecreaseImpliedIncrease++;
          }
        } else {
          if (currentChange >= 0) {
            comparison.previousIncreaseImpliedDecrease++;
          } else {
            comparison.previousDecreaseImpliedDecrease++;
          }
        }
      }

    }
  }

  async updateForSymbols(date: Date): Promise<void> {
    console.log(`${dateUtil.formatDate(date)} - Updating stock maps...`);
    let changes: PriceChange[];
    let futureChanges: PriceChange[];
    try {
      changes = await PriceChange.createPrevious(date);
      futureChanges = await PriceChange.createFuture(date);
    } catch (e) {
      console.log(`${dateUtil.formatDate(date)} - Missing price changes... ` + e.message);
      return;
    }

    let num = 0;
    for (const futureChange of futureChanges) {
      try {
        const stockMap = await StockMap.readStockMap(futureChange.symbol);
        this.updateForSymbol(changes, futureChange, stockMap);
        await stockMap.write();
        num++;
      } catch (e) { }
    }
    console.log(`${dateUtil.formatDate(date)} - Finished updating ${num} stock maps!`);
  }

  async createChangeIndicatorsForDate(date: Date): Promise<void> {
    console.log(`${dateUtil.formatDate(date)} - Creating change indicators...`);
    const indicators: Indicator[] = [];
    let priceChanges: PriceChange[] = [];
    try {
      priceChanges = await PriceChange.createPrevious(date);
    } catch (e) {
      console.log(`${dateUtil.formatDate(date)} - No price changes for date.`, e.message);
      return;
    }
    const stockMaps = await StockMap.createStockMapsForDate(date);
    for (const priceChange of priceChanges) {
      try {
        // const stockMap = await StockMap.readStockMap(priceChange.symbol);
        const stockMap = stockMaps.find(sm => sm.stock === priceChange.symbol);
        const indicator = stockMap && this.createChangeIndicatorForSymbol(priceChange.symbol, stockMap, priceChanges);
        if (indicator) {
          indicators.push(indicator);
        }

      } catch (e) {
        console.log(e);
      }
    }
    if (indicators.length > 0) {
      console.log(`${dateUtil.formatDate(date)} - Saving ${indicators.length} indicators.`);
      await fileUtil.saveObject(Indicator.dir, `${dateUtil.formatDate(date)}.change.json`, indicators);
    } else {
      console.log(`${dateUtil.formatDate(date)} - No indicators found.`);
    }
  }

  createChangeIndicatorForSymbol(symbol: string, stockMap: StockMap, priceChanges: PriceChange[]): Indicator | undefined {
    let values: number[] = [];
    for (const priceChange of priceChanges) {
      const pc = stockMap.previousComparisons.find(pc1 => pc1.stock === priceChange.symbol);
      if (pc) {
        let v: number;
        if (priceChange.change >= 0) {
          v = pc.previousIncreaseImpliedIncrease / (pc.previousIncreaseImpliedIncrease + pc.previousIncreaseImpliedDecrease);
        } else {
          v = pc.previousDecreaseImpliedIncrease / (pc.previousDecreaseImpliedIncrease + pc.previousDecreaseImpliedDecrease);
        }
        if (!isNaN(v)) {
          values.push(v);
        }
      }
    }
    if (!values || values.length === 0) {
      return undefined;
    }
    const indicator = new Indicator(symbol);
    indicator.value = Calculator.findMean(values);
    indicator.value = isNaN(indicator.value) ? 0 : indicator.value;
    return indicator;
  }
}
