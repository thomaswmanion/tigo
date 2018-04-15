import { symbolUtil } from './../util/symbol.util';
import { fileUtil } from './../util/file.util';
import { PriceChange } from '../pricing/price-change.model';
import { Rule, RuleItem } from './rule.model';
import { dateUtil } from './../util/date.util';
import { Calculator } from '../util/calculator.util';
import { variables } from '../variables';

class RuleUtil {
  findMatchingRuleValue(
    rules: Rule[],
    dayChange: number,
    weekChange: number,
    monthChange: number,
    quarterChange: number
  ): number {
    const defaultValue = Calculator.findMedian(rules.map(r => r.value));;
    for (const rule of rules) {
      if (this.isInRange(dayChange, rule.dayMin, rule.dayMax)
        && this.isInRange(weekChange, rule.weekMin, rule.weekMax)
        && this.isInRange(monthChange, rule.monthMin, rule.monthMax)
        && this.isInRange(quarterChange, rule.quarterMin, rule.quarterMax)) {
        return rule.value;
      }
    }
    return defaultValue;
  }

  isInRange(current: number, min: number, max: number): boolean {
    return current >= min && current <= max;
  }

  async createRulesForDate(date: Date): Promise<Rule[]> {
    const dateToCollect = dateUtil.getDaysAgo(variables.numPredictedDays, date);
    console.log('Collecting rule items...');
    const items: RuleItem[] = await this.createRuleItemsForDate(dateToCollect);
    console.log(`Collected ${items.length} rule items. Generating rules...`);
    const rules: Rule[] = this.generateRulesFromItems(items);
    console.log(`Created ${rules.length} rules.`);
    console.log(JSON.stringify(rules));
    return rules;
  }

  async createRuleItemsForDate(date: Date): Promise<RuleItem[]> {
    let items: RuleItem[] = [];
    let curDate = date;
    let numAdded = 0;
    for (let i = 0; numAdded < variables.numPrevousVolatilitySteps && i < 1000; i++) {
      try {
        console.log(dateUtil.formatDate(curDate));
        const sub = await this.createRuleItemsForSubDate(curDate);
        numAdded++;
        items.push(...sub);
      } catch (e) { }
      curDate = dateUtil.getPreviousWorkDay(curDate);
    }
    return items;
  }
  async createRuleItemsForSubDate(date: Date): Promise<RuleItem[]> {
    const cacheExists = await fileUtil.exists('rule-cache', dateUtil.formatDate(date) + '.json');
    if (cacheExists) {
      const obj = await fileUtil.readObject('rule-cache', dateUtil.formatDate(date) + '.json');
      return obj;
    }
    let items: RuleItem[] = [];
    const symbols = await symbolUtil.getSymbols();
    const days = (await PriceChange.createPreviousNDays(date, 1)).filter(s => symbols.indexOf(s.symbol) !== -1);
    const weeks = await PriceChange.createPreviousNDays(date, 5);
    const months = await PriceChange.createPreviousNDays(date, 20);
    const quarters = await PriceChange.createPreviousNDays(date, 60);
    const futures = await PriceChange.createFutureNDays(date, variables.numPredictedDays);
    for (const day of days) {
      const week = weeks.find(i => i.symbol === day.symbol);
      const month = months.find(i => i.symbol === day.symbol);
      const quarter = quarters.find(i => i.symbol === day.symbol);
      const earning = futures.find(i => i.symbol === day.symbol);
      if (day && week && month && quarter && earning) {
        items.push({
          day: day.change,
          week: week.change,
          month: month.change,
          quarter: quarter.change,
          earning: earning.change
        });
      }
    }
    await fileUtil.saveObject('rule-cache', dateUtil.formatDate(date) + '.json', items);
    return items;
  }

  generateRulesFromItems(items: RuleItem[]): Rule[] {
    const minLength = items.length / 500;
    let rules: Rule[] = [];
    for (let i = 0; i < variables.numDiscoveryTries; i++) {
      const rule = this.createRandomRule();

      const matchingItems = this.findItemsThatMatchRule(rule, items);

      rule.value = Calculator.findMedian(matchingItems.map(i => i.earning));
      if (matchingItems.length >= minLength) {
        rule.matchingItems = matchingItems.length / items.length;
        rules.push(rule);
        rules.sort((a, b) => b.value - a.value);
        rules = rules.filter((_, i) => i < variables.maxVolatilityRules);
      }
    }
    return rules;
  }

  createRandomRule(): Rule {
    let dayMin: number = -5, dayMax: number = 5, dayRandom = Math.random();
    if (dayRandom > 0.75) {
      dayMin = this.getValInRange(-1, 1);
    } else if (dayRandom > 0.5) {
      dayMax = this.getValInRange(-1, 1);
    } else if (dayRandom > 0.25) {
      dayMin = this.getValInRange(-1, 1);
      dayMax = this.getValInRange(dayMin, 1);
    }

    let weekMin: number = -5, weekMax: number = 5, weekRandom = Math.random();
    if (weekRandom > 0.75) {
      weekMin = this.getValInRange(-1, 1);
    } else if (weekRandom > 0.5) {
      weekMax = this.getValInRange(-1, 1);
    } else if (weekRandom > 0.25) {
      weekMin = this.getValInRange(-1, 1);
      weekMax = this.getValInRange(weekMin, 1);
    }

    let monthMin: number = -5, monthMax: number = 5, monthRandom = Math.random();
    if (monthRandom > 0.75) {
      monthMin = this.getValInRange(-1, 1);
    } else if (monthRandom > 0.5) {
      monthMax = this.getValInRange(-1, 1);
    } else if (monthRandom > 0.25) {
      monthMin = this.getValInRange(-1, 1);
      monthMax = this.getValInRange(monthMin, 1);
    }

    let quarterMin: number = -5, quarterMax: number = 5, quarterRandom = Math.random();
    if (quarterRandom > 0.75) {
      quarterMin = this.getValInRange(-1, 1);
    } else if (quarterRandom > 0.5) {
      quarterMax = this.getValInRange(-1, 1);
    } else if (quarterRandom > 0.25) {
      quarterMin = this.getValInRange(-1, 1);
      quarterMax = this.getValInRange(quarterMin, 1);
    }

    return new Rule(
      dayMin, dayMax,
      weekMin, weekMax,
      monthMin, monthMax,
      quarterMin, quarterMax,
      0
    );
  }

  getValInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  findItemsThatMatchRule(rule: Rule, items: RuleItem[]): RuleItem[] {
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
}

export const ruleUtil = new RuleUtil();
