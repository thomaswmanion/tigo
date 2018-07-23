export class Indicator {
  static dir = 'indicators';
  public type: string;

  public value = 0;
  constructor(
    public symbol: string
  ) { }
}