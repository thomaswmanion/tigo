import { dateUtil } from '../util/date.util';
import { Calculator } from '../util/calculator.util';
import { Robinhood } from '../robinhood/robinhood.api';

export class Trade {
  public name: string;
  public symbol: string;

  constructor(
    public account: string,
    public side: 'buy' | 'sell',
    public instrument: string,
    public price: number,
    public date: Date,
    public quantity: number
  ) { }


  get id() {
    return this.symbol + '-' + +this.date;
  }

  async inflateFromInstrument(robinhood: Robinhood): Promise<void> {
    if (this.instrument) {
      const res = await robinhood.get(this.instrument);
      this.name = res.name;
      this.symbol = res.symbol;
    }
  }

  toDbItem() {
    return {
      id: this.id,
      account: this.account,
      side: this.side,
      symbol: this.symbol,
      price: this.price,
      date: this.date.toISOString(),
      quantity: this.quantity
    };
  }
}

export class TradeResult {
  constructor(
    public stock: string,
    public purchaseDate: Date,
    public purchasePrice: number,
    public sellDate: Date,
    public sellPrice: number,
    public num: number,
    public account: string
  ) { }

  get changePercent(): number {
    return Calculator.changePercent(this.sellPrice, this.purchasePrice);
  }

  get numDays(): number {
    return dateUtil.getWeekdayMsBetweenDates(this.purchaseDate, this.sellDate) / 8.64e+7;
  }

  get percentEarningPerDay(): number {
    return this.changePercent / this.numDays;
  }
}