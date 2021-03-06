import { fileUtil } from './file.util';
import * as fs from 'fs-extra';
import * as path from 'path';
import { variables } from '../variables';

class SymbolUtil {
  getCurrentIndustries(): string[] {
    return [
      'basic-industries',
      'capital-goods',
      'consumer-services',
      'energy',
      'finance',
      'healthcare',
      'misc',
      'non-durables',
      'public-utilities',
      'technology',
      'transportation'
    ];
  }

  async readIndustryFile(industry: string): Promise<string[]> {
    const p = path.join(__dirname, '../../symbols/', industry + '.json');
    const symbols = await fileUtil.readLocalObject(p);
    return symbols;
  }

  async getIndustryFilepaths(): Promise<string[]> {
    const p = path.join(__dirname, '../../symbols');
    let ls: string[];
    if (variables.symbolFile === 'all') {
      ls = await fs.readdir(path.join(p));
    } else {
      ls = [variables.symbolFile];
    }
    console.log('Industry Filepaths', JSON.stringify(ls));
    return ls.map(i => path.join(p, i));
  }

  async getSymbols(industry?: string): Promise<string[]> {
    if (industry) {
      const s = await this.readIndustryFile(industry);
      return s;
    }
    const industries = this.getCurrentIndustries();
    const symbols: string[] = [];
    for (const industry of industries) {
      const s = await this.readIndustryFile(industry);
      symbols.push(...s);
    }

    return symbols;
  }

  async getAllSymbols(): Promise<string[]> {
    const s = await fs.readFile(path.join(__dirname, '../../all-symbols.json', ), 'utf-8');
    let symbols: string[] = JSON.parse(s);
    return symbols;
  }
}

export const symbolUtil = new SymbolUtil();
