export class Prediction {
  static dir = 'predictions';

  constructor(
    public symbol: string,
    public value: number
  ) { }
}