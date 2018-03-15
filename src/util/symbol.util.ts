import { fileUtil } from './file.util';
import * as fs from 'fs-extra';
import * as path from 'path';
import { variables } from '../variables';

class SymbolUtil {
  async getCurrentIndustry(): Promise<string> {
    return await fileUtil.readObject('.', `industry.json`);
  }

  async readIndustryFile(industry: string): Promise<string[]> {
    const p = path.join(__dirname, '../../symbols/', industry + '.json');
    const symbols = await fileUtil.readLocalObject(p);
    return symbols;
  }

  async getIndustryFilepaths(): Promise<string[]> {
    const p = path.join(__dirname, '../../symbols');
    const ls = await fs.readdir(path.join(p));
    // const ls = ['healthcare.1.json'];
    return ls.map(i => path.join(p, i));
  }

  async getAllHealthcareSymbols(): Promise<string[]> {
    const s = await fs.readFile(path.join(__dirname, '../../symbols.json', ), 'utf-8');
    let symbols: string[] = JSON.parse(s);
    return symbols;
  }
  async getSymbols(): Promise<string[]> {
    const industry = await this.getCurrentIndustry();
    const symbols = await this.readIndustryFile(industry);
    return symbols;
  }

  async getAllSymbols(): Promise<string[]> {
    const s = await fs.readFile(path.join(__dirname, '../../all-symbols.json', ), 'utf-8');
    let symbols: string[] = JSON.parse(s);
    if (variables.useSymbolSubset) {
      symbols = symbols.filter((_, i) => i % variables.symbolSubset === 0);
    }
    return symbols;
  }
}

export const symbolUtil = new SymbolUtil();
