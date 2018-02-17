import * as fs from 'fs-extra';
import * as path from 'path';
import { variables } from '../variables';

class SymbolUtil {
  async getSymbols(): Promise<string[]> {
    const s = await fs.readFile(path.join(__dirname, '../../symbols.json', ), 'utf-8');
    let symbols: string[] = JSON.parse(s);
    if (variables.useSymbolSubset) {
      symbols = symbols.filter((_, i) => i % 3 === 0);
    }
    return symbols;
  }
}

export const symbolUtil = new SymbolUtil();
