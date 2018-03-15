import { variables } from "../../variables";

export class StockDirection {
  increase = 0;
  decrease = 0;

  constructor(public symbol: string) { }


  getTotal(): number {
    return this.increase + this.decrease;
  }

  hasMinimum(): boolean {
    return this.getTotal() > (variables.stockPickRange / 3);
  }

  getIncreaseFraction(): number {
    return this.increase / this.getTotal();
  }
}