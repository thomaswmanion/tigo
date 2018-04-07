import { Calculator } from '../util/calculator.util';
import { rules } from './rules';

class RuleUtil {
  defaultValue = Calculator.findMedian(rules.map(r => r.value));
  findMatchingRuleValue(
    dayChange: number,
    weekChange: number,
    monthChange: number,
    quarterChange: number
  ): number {
    for (const rule of rules) {
      if (this.isInRange(dayChange, rule.dayMin, rule.dayMax)
        && this.isInRange(weekChange, rule.weekMin, rule.weekMax)
        && this.isInRange(monthChange, rule.monthMin, rule.monthMax)
        && this.isInRange(quarterChange, rule.quarterMin, rule.quarterMax)) {
        return rule.value;
      }
    }
    return this.defaultValue;
  }

  isInRange(current: number, min: number, max: number): boolean {
    return current >= min && current <= max;
  }
}

export const ruleUtil = new RuleUtil();
