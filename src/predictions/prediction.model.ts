export class Prediction {
  static dir = 'predictions';

  constructor(
    public symbol: string,
    public value: number
  ) { }
}

export class PredictionDate {
  constructor(
    public prediction: Prediction,
    public date: Date
  ) { }
}
