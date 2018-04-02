class PrintUtil {
  asPercent(fraction: number): string {
    return (fraction * 100).toFixed(3) + '%';
  }
}

export const printUtil = new PrintUtil();
