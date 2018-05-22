import { dateUtil } from '../util/date.util';
import { symbolUtil } from '../util/symbol.util';
import { fileUtil } from '../util/file.util';
import { variables } from '../variables';
import { HistoricalChangeUpdater } from './historical-change.updater';
import { PriceChange } from '../pricing/price-change.model';
import { String } from 'aws-sdk/clients/ec2';

export class StockMap {
  static dir = 'maps';

  constructor(
    public stock: string,
    public increases: number,
    public decreases: number,
    public changeSum: number,
    public totalChanges: number,
    public previousComparisons: PreviousComparison[]
  ) { }

  get increaseFraction(): number {
    return this.increases / this.total;
  }

  get decreaseFraction(): number {
    return 1 - this.increaseFraction;
  }

  get total(): number {
    return this.previousComparisons.map(p => p.getCount()).reduce((a, b) => a + b, 0) / this.previousComparisons.length;
  }

  get averageChange(): number {
    return this.totalChanges === 0 ? 0 : this.changeSum / this.totalChanges;
  }

  static async readStockMap(stock: string): Promise<StockMap> {
    try {
      const fileContent = await fileUtil.readObject(this.dir, `${stock}.json`);
      return this.parseContentsFromFile(fileContent);
    } catch (e) {
      return new StockMap(stock, 0, 0, 0, 0, await PreviousComparison.createNewArray());
    }
  }

  static async createStockMapsForDate(date: Date, type: string): Promise<StockMap[]> {
    const industries = symbolUtil.getCurrentIndustries();
    const maps: StockMap[] = [];
    for (const industry of industries) {
      try {
        const m = await this.createStockMapsForDateForIndustry(date, type, industry);
        maps.push(...m);
      } catch (e) { }
    }
    return maps;
  }

  static async createStockMapsForDateForIndustry(date: Date, type: string, industry: string): Promise<StockMap[]> {

    const symbols = await symbolUtil.getSymbols(industry);
    console.log(industry, `${symbols.length} symbols`);
    let maps = symbols.map(s => {
      const pc = PreviousComparison.createNewArrayFromSymbols(symbols);
      const map = new StockMap(s, 0, 0, 0, 0, pc);
      return map;
    })
    const hcu = new HistoricalChangeUpdater();
    let curDate = dateUtil.getDaysAgo(variables.numPredictedDays, date);
    const steps = type === 'change' ? variables.mapSteps : variables.longMapSteps;
    let numAdded = 0;
    for (let i = 0; numAdded < steps && i < 1000; i++) {
      console.log(dateUtil.formatDate(curDate));
      let changes: PriceChange[] = [];
      let futureChanges: PriceChange[] = [];
      try {
        changes = await PriceChange.createPrevious(curDate);
        futureChanges = await PriceChange.createFuture(curDate);

        changes = changes.filter(c => symbols.indexOf(c.symbol) !== -1);
        futureChanges = futureChanges.filter(c => symbols.indexOf(c.symbol) !== -1);
        numAdded++;
      } catch (e) {
        // console.log(e);
      }

      if (changes.length && futureChanges.length) {
        for (const futureChange of futureChanges) {
          try {
            const stockMap = maps.find(m => m.stock === futureChange.symbol);
            if (stockMap) {
              hcu.updateForSymbol(changes, futureChange, stockMap);
            }
          } catch (e) { }
        }
      }

      curDate = dateUtil.getDaysAgo(variables.mapStepSize, curDate);
    }

    return maps;
  }

  async write(): Promise<void> {
    await fileUtil.saveObject(StockMap.dir, `${this.stock}.json`, {
      stock: this.stock,
      increases: this.increases,
      decreases: this.decreases,
      previousComparisons: this.previousComparisons.map(p => p.createContentsForFile())
    });
  }

  static parseContentsFromFile(obj: any): StockMap {
    const previousComparisons = PreviousComparison.parseContentsFromFile(obj.previousComparisons)
    return new StockMap(obj.stock, obj.increases, obj.decreases, obj.changeSum, obj.totalChanges, previousComparisons);
  }
}

export class PreviousComparison {
  constructor(
    public stock: string,
    public previousIncreaseImpliedIncrease: number,
    public previousIncreaseImpliedDecrease: number,
    public previousDecreaseImpliedIncrease: number,
    public previousDecreaseImpliedDecrease: number
  ) { }

  static async createNewArray(): Promise<PreviousComparison[]> {
    const stocks = await symbolUtil.getSymbols();
    return stocks.map(s => new PreviousComparison(s, 0, 0, 0, 0));
  }

  static createNewArrayFromSymbols(symbols: string[]): PreviousComparison[] {
    return symbols.map(s => new PreviousComparison(s, 0, 0, 0, 0));
  }

  getCount(): number {
    return this.previousDecreaseImpliedDecrease + this.previousDecreaseImpliedIncrease + this.previousIncreaseImpliedDecrease + this.previousIncreaseImpliedIncrease;
  }

  static parseContentsFromFile(arr: any[]): PreviousComparison[] {
    return arr.map(obj => new PreviousComparison(
      obj[0],
      obj[1],
      obj[2],
      obj[3],
      obj[4]
    ));
  }

  short(num: number): number {
    return parseFloat(num.toFixed(4));
  }

  createContentsForFile(): any[] {
    return [
      this.stock,
      this.short(this.previousIncreaseImpliedIncrease),
      this.short(this.previousIncreaseImpliedDecrease),
      this.short(this.previousDecreaseImpliedIncrease),
      this.short(this.previousDecreaseImpliedDecrease)
    ];
  }
}
