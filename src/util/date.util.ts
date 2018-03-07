import { argv } from 'yargs'

export class DateUtil {
  _holidays: string[];
  oneDay: number = 1000 * 60 * 60 * 24;
  todayDate: Date;
  overrideToday: Date;
  get today(): Date {
    if (this.overrideToday) {
      return this.overrideToday;
    }
    if (!this.todayDate) {
      if (argv.today === 'yesterday') {
        this.todayDate = this.getPreviousWorkDay(new Date());
      }
      else {
        this.todayDate = argv.today ? new Date(argv.today) : new Date();
      }
    }
    return this.todayDate;
  }

  get holidays(): string[] {
    if (!this._holidays) {
      this._holidays = require('../../holidays.json').map((h: string) => this.formatDate(new Date(h)));
    }
    return this._holidays;
  }

  get tomorrow(): Date {
    return this.getDaysInTheFuture(1, this.today);
  }

  get yesterday(): Date {
    return this.getDaysAgo(1, this.today);
  }

  formatDate(date: Date, char?: string): string {
    char = char || '-';
    let year: string = date.getFullYear() + '';
    let month: number = date.getMonth() + 1;
    let monthStr: string = (month < 10 ? '0' : '') + month;
    let day: string = (date.getDate() < 10 ? '0' : '') + date.getDate();

    let formatted = [year, monthStr, day].join(char);
    return formatted;
  }

  formatDateTime(date: Date): string {
    return date.toISOString();
  }

  getUntilDate(day: Date): string {
    const t = new Date(+day + this.oneDay);
    return this.formatDate(t);
  }

  getTimeOnDate(date: Date, hours: number, min?: number, sec?: number, ms?: number): Date {
    const modified = new Date(+date);
    modified.setUTCHours(hours, min, sec, ms);
    return modified;
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    const formatted = this.formatDate(date);
    return (day === 6) || (day === 0) || this.holidays.indexOf(formatted) !== -1;
  }

  /**
   * Calculate the weekday milliseconds between two weekday dates.
   */
  getWeekdayMsBetweenDates(early: Date, later: Date): number {
    let msChange = +later - +early;
    let curDate = early;
    while (curDate <= later) {
      if (this.isWeekend(curDate)) {
        msChange -= this.oneDay;
      }
      curDate = new Date(+curDate + this.oneDay);
    }
    return msChange;
  }

  getDaysAgo(n: number, refDate: Date): Date {
    let daysRemoved = 0, i = 0;
    let posMultiplier = n >= 0 ? 1 : -1;
    let date: Date = refDate;
    while (daysRemoved <= Math.abs(n)) {
      date = new Date(+refDate - (i * this.oneDay * posMultiplier));
      if (!this.isWeekend(date)) {
        daysRemoved++;
      }
      i++;
    }
    return date;
  }

  getTotalDaysAgo(n: number, date: Date): Date {
    return new Date(+date - (this.oneDay * n));
  }

  getTotalDaysInTheFuture(n: number, date: Date): Date {
    return new Date(+date + (this.oneDay * n));
  }

  getDaysInTheFuture(n: number, refDate: Date): Date {
    return this.getDaysAgo(n * -1, refDate);
  }

  getPreviousWorkDay(date: Date): Date {
    let prevDate = date;
    let isWeekend = true;
    while (isWeekend) {
      prevDate = new Date(+prevDate - this.oneDay);
      isWeekend = this.isWeekend(prevDate);
    }
    return prevDate;
  }

  getNextWorkDay(date: Date): Date {
    let nextDate = date;
    let isWeekend = true;
    while (isWeekend) {
      nextDate = new Date(+nextDate + this.oneDay);
      isWeekend = this.isWeekend(nextDate)
    }
    return nextDate;
  }

  async sleep(time: number): Promise<any> {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  prettyDate(date: Date): string {
    const monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const prettyDay = date.getDay();

    return dayNames[prettyDay] + ', ' + monthNames[monthIndex] + ' ' + day + ', ' + year;
  }
}

export const dateUtil = new DateUtil();
