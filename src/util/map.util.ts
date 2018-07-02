class MapUtil {
  convertArrayToSymbolMap<T extends RequiredArray>(arr: T[]): Map<string, T> {
    const map = new Map<string, T>();

    arr.forEach(a => {
      const symbol = a.symbol
      map.set(symbol, a);
    });

    return map;
  }
}

interface RequiredArray {
  symbol: string;
}

export const mapUtil = new MapUtil();
