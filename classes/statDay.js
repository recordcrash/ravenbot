const util = require('util');
const { addDays, getRawDateString } = require('../helpers/dates');

const DATE_COL = 0; // Unused because sheet isn't using real dates
const TOTAL_WORDS_COL = 1;
const BASE_DATE_STRING = '2021-08-08T00:00:00.000-05:00';
const BASE_WORDS = 67062; // Manually fetched late 2021-08-06

class StatDay {
  constructor(date, totalWords, previousDayWords) {
    this.date = date;
    this.totalWords = totalWords;
    this.wordsPerDay = totalWords - previousDayWords;
  }

  get dateString() {
    return getRawDateString(this.date);
  }

  static statDays = [];

  static baseDate = null;

  static grandTotal = 0;

  static getChartLabels() {
    const labels = [];
    StatDay.statDays.forEach((day) => labels.push(`'${day.dateString}'`));
    return labels;
  }

  static getChartData() {
    const data = [];
    StatDay.statDays.forEach((day) => data.push(day.wordsPerDay));
    return data;
  }

  static getChartUrl() {
    return `https://quickchart.io/chart?bkg=black&c={type:'line',data:{labels:[${StatDay.getChartLabels()}],datasets:[{label:'TUTBAD Words per Day',data:[${StatDay.getChartData()}]}]}}`;
  }

  static initializeBaseDate() {
    StatDay.baseDate = new Date(BASE_DATE_STRING);
  }

  static initializeStatsManager(sheetRows) {
    StatDay.statDays.length = 0;
    StatDay.initializeBaseDate();
    let currentDate = StatDay.baseDate;
    let currentWords = BASE_WORDS;
    sheetRows.forEach((row) => {
      const statDate = currentDate;
      const statTotalWords = row[TOTAL_WORDS_COL];
      const statDay = new StatDay(statDate, statTotalWords, currentWords);
      StatDay.statDays.push(statDay);
      currentDate = addDays(currentDate, 1);
      currentWords = statTotalWords;
    });
  }
}

module.exports = ({ StatDay });
