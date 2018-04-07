import { printUtil } from './../../util/print.util';
import { Calculator } from './../../util/calculator.util';
import { fileUtil } from './../../util/file.util';
import { Rule } from '../../rule/rule.model';

export async function run() {
  let rules: Rule[] = [];
  const items = await readFile();
  const minLength = items.length / 100;
  let runs = 0;
  const overallMedian = Calculator.findMedian(items.map(i => i.earning));
  const totalRuns = 1000 * 100000;
  while (runs < totalRuns) {
    const rule = createRandomRule();

    const matchingItems = findItemsThatMatchRule(rule, items);

    rule.value = Calculator.findMedian(matchingItems.map(i => i.earning));
    if (matchingItems.length >= minLength && rule.value > overallMedian) {
      
      rules.push(rule);
      rules.sort((a, b) => b.value - a.value);
      rules = rules.filter((_, i) => i < 200);
    }

    runs++;
    if (runs % 1000 === 0) {
      rules.filter((_, i) => i < 5);
      console.log(Math.floor(runs / 1000) + ` - Overall Median: ${printUtil.asPercent(overallMedian)}`);
      rules.filter((_, i) => i < 10).forEach((item, i) => {
        console.log(`${i} - ${printUtil.asPercent(item.value)}`);
      });
      await fileUtil.saveObject('.', 'rules.json', rules);
    }
  }

}
run();


interface Item {
  day: number;
  week: number;
  month: number;
  quarter: number;
  earning: number;
}

async function readFile(): Promise<Item[]> {
  const string = await fileUtil.readString('test', 'volatility.csv');
  const lines = string.split(/[\n\r]+/);
  return lines.map(l => {
    const p = l.split(',');
    return {
      day: parseFloat(p[0]),
      week: parseFloat(p[1]),
      month: parseFloat(p[2]),
      quarter: parseFloat(p[3]),
      earning: parseFloat(p[4])
    };
  }).filter(i => i.earning && !isNaN(i.earning));
}

function createRandomRule(): Rule {
  let dayMin: number = -5, dayMax: number = 5, dayRandom = Math.random();
  if (dayRandom > 0.75) {
    dayMin = getValInRange(-1, 1);
  } else if (dayRandom > 0.5) {
    dayMax = getValInRange(-1, 1);
  } else if (dayRandom > 0.25) {
    dayMin = getValInRange(-1, 1);
    dayMax = getValInRange(dayMin, 1);
  }

  let weekMin: number = -5, weekMax: number = 5, weekRandom = Math.random();
  if (weekRandom > 0.75) {
    weekMin = getValInRange(-1, 1);
  } else if (weekRandom > 0.5) {
    weekMax = getValInRange(-1, 1);
  } else if (weekRandom > 0.25) {
    weekMin = getValInRange(-1, 1);
    weekMax = getValInRange(weekMin, 1);
  }

  let monthMin: number = -5, monthMax: number = 5, monthRandom = Math.random();
  if (monthRandom > 0.75) {
    monthMin = getValInRange(-1, 1);
  } else if (monthRandom > 0.5) {
    monthMax = getValInRange(-1, 1);
  } else if (monthRandom > 0.25) {
    monthMin = getValInRange(-1, 1);
    monthMax = getValInRange(monthMin, 1);
  }

  let quarterMin: number = -5, quarterMax: number = 5, quarterRandom = Math.random();
  if (quarterRandom > 0.75) {
    quarterMin = getValInRange(-1, 1);
  } else if (quarterRandom > 0.5) {
    quarterMax = getValInRange(-1, 1);
  } else if (quarterRandom > 0.25) {
    quarterMin = getValInRange(-1, 1);
    quarterMax = getValInRange(quarterMin, 1);
  }

  return new Rule(
    dayMin, dayMax,
    weekMin, weekMax,
    monthMin, monthMax,
    quarterMin, quarterMax,
    0
  );
}

function getValInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}


function findItemsThatMatchRule(rule: Rule, items: Item[]): Item[] {
  return items.filter(i => {

    return i.day > rule.dayMin
      && i.day < rule.dayMax
      && i.week > rule.weekMin
      && i.week < rule.weekMax
      && i.month > rule.monthMin
      && i.month < rule.monthMax
      && i.quarter > rule.quarterMin
      && i.quarter < rule.quarterMax;
  });
}