export class Calculator {
  static change(after: number, before: number): number {
    if (before === 0) {
      throw new Error('Cannot divide by 0');
    }
    return (after - before) / before;
  }

  static changePercent(after: number, before: number): number {
    return this.change(after, before) * 100;
  }

  static findMedian(data: number[]): number {
    if (!data || !data.length) {
      return 0;
    }

    data.sort((a, b) => a - b);
    const middle = Math.floor((data.length - 1) / 2);
    if (data.length % 2) {
      return data[middle];
    } else {
      return (data[middle] + data[middle + 1]) / 2.0;
    }
  }

  static findMean(data: number[]): number {
    if (!data || !data.length) {
      return 0;
    }
    const total = data.reduce((a, b) => a + b);
    return total / data.length;
  }

  short(num: number, digits: number = 4): number {
    return parseFloat(num.toFixed(digits));
  }
}