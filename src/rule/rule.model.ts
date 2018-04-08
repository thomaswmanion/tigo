export class Rule {
  public matchingItems: number;
  constructor(
    public dayMin: number = -5,
    public dayMax: number = 5,
    public weekMin: number = -5,
    public weekMax: number = 5,
    public monthMin: number = -5,
    public monthMax: number = 5,
    public quarterMin: number = -5,
    public quarterMax: number = 5,
    public value: number
  ) { }
}


export interface RuleItem {
  day: number;
  week: number;
  month: number;
  quarter: number;
  earning: number;
}