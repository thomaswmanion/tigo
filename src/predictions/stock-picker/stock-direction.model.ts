export class StockDirection {
  increase = 0;
  decrease = 0;

  constructor(public symbol: string) { }


  getTotal(): number {
    return this.increase + this.decrease;
  }

  getIncreaseFraction(): number {
    return this.increase / this.getTotal();
  }
}