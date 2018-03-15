import { fileUtil } from './../../util/file.util';
import * as path from 'path';
import { symbolUtil } from '../../util/symbol.util';

export async function run() {
  const tradeableSymbols = await symbolUtil.getAllSymbols();
  const industries = [
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
  for (const industry of industries) {
    const symbols: string[] = await fileUtil.readLocalObject(path.join(__dirname, `/../../../${industry}.json`));
    const tradeable: string[] = symbols.filter(symbol => tradeableSymbols.indexOf(symbol) !== -1);
    
    const groupLength = findGroupLength(tradeable.length);
    console.log(industry, tradeable.length, groupLength);
    for (let i = 1; i <= groupLength; i++) {
      const filename = `${industry}.${i}.json`;
      const fileSymbols = tradeable.filter((_, j) => j % groupLength === (i - 1));
      console.log(`Creating ${filename} with ${fileSymbols.length} symbols!`);
      await fileUtil.saveLocalObject(path.join(__dirname, '../../../symbols/', filename), fileSymbols);
    }
  }


}
run();

function findGroupLength(l: number): number {
  if (l < 180) {
    return 1;
  }
  for (let i = 1; i < 10; i++) {
    const groupSize = Math.round(l / i);
    if (groupSize >= 180 && groupSize <= 250) {
      return i;
    }
  }

  for (let i = 1; i < 10; i++) {
    const groupSize = Math.round(l / i);
    if (groupSize >= 200 && groupSize <= 400) {
      return i;
    }
  }
  return 5;
}
