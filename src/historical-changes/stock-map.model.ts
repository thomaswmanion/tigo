import { symbolUtil } from './../util/symbol.util';
import { fileUtil } from './../util/file.util';
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
    return this.increases + this.decreases;
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
