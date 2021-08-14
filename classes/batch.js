const util = require('util');
const { getDateString } = require('../helpers/dates');
const { Chapter } = require('./chapter');

const CHAPTER_COL = 0;
const EB_DATE_COL = 1;
const DATE_COL = 2;
const WORDS_COL = 3;
const NOTES_COL = 4;

class Batch {
  constructor(number, ebReleaseDate, releaseDate, chapters) {
    this.number = Number(number);
    this.ebReleaseDate = ebReleaseDate;
    this.releaseDate = releaseDate;
    this.chapters = chapters;
    this.words = this.chapters.reduce((sum, { words }) => sum + words, 0);
  }

  static #_FIRSTBATCH = 'First batch'; // Edge case when bot starts functioning, only one batch exists

  static #_PRERELEASE = 'Pre-release'; // Next batch is finished, but its date is in the future

  static #_POSTRELEASE = 'Post-release'; // Next batch is finished, but its date is in the past

  static #_NORELEASE = 'No release date'; // Next batch has no date, usual case

  static #_ERROR = 'I AM ERROR'; // Edge case, need to add new condition

  static get FIRSTBATCH() { return this.#_FIRSTBATCH; }

  static get PRERELEASE() { return this.#_PRERELEASE; }

  static get POSTRELEASE() { return this.#_POSTRELEASE; }

  static get NORELEASE() { return this.#_NORELEASE; }

  static get ERROR() { return this.#_ERROR; }

  static globalStatus = Batch.FIRSTBATCH;

  static updateDateString = null;

  static batches = [];

  static grandTotal = 0;

  get nextBatch() {
    return Batch.batches.length !== this.number ? Batch.batches[this.number + 1] : this;
  }

  get previousBatch() {
    return this.number > 1 ? Batch.batches[this.number - 1] : this;
  }

  static lastUpdateDate() {
    const today = new Date();
    let lastDate = new Date();
    Batch.batches.forEach((batch) => {
      if (batch.releaseDate && Batch.daysBetween(today, batch.releaseDate) < 0) {
        lastDate = batch.releaseDate;
      }
    });
    return lastDate;
  }

  get nextReleaseDate() {
    return this.nextBatch?.releaseDate || 'Never';
  }

  get lastBatchString() {
    if (this.releaseStatus === Batch.FIRSTBATCH) return 'No previous batches found!';
    const daysBetween = Batch.daysBetween(Batch.lastUpdateDate(), new Date());
    const pluralString = (daysBetween === 1 || daysBetween === -1) ? '' : 's';
    const dateString = getDateString(Batch.lastUpdateDate());
    if (daysBetween > 0) return `**${dateString}** (${daysBetween} day${pluralString} ago)`;
    return `**${dateString}** (${daysBetween * -1} day${pluralString} from now)`;
  }

  get upcomingBatchStats() {
    return `${this.words} words`;
  }

  get chapterList() {
    let chapterListString = '';
    this.chapters.forEach((chapter) => {
      const notesString = chapter.notes ? ` (${chapter.notes})` : '';
      chapterListString += `Chapter ${chapter.number}: ${chapter.words} words${notesString}\n`;
    });
    return chapterListString;
  }

  get releaseStatus() {
    const today = new Date();
    if (!this.releaseDate) return Batch.NORELEASE;
    if (today < this.releaseDate) return Batch.PRERELEASE;
    return Batch.POSTRELEASE;
  }

  get embedTitle() {
    switch (this.releaseStatus) {
      case Batch.FIRSTBATCH:
        return 'Story release progress';
      case Batch.NORELEASE:
        return 'Upcoming chapter progress';
      case Batch.PRERELEASE:
      case Batch.POSTRELEASE:
        return 'Finished batch information';
      default:
        return 'You really shouldn\'t be able to see this';
    }
  }

  get embedDescription() {
    switch (this.releaseStatus) {
      case Batch.FIRSTBATCH:
        return `Available for the [Early Birds Patreon tier](https://www.patreon.com/alexanderwales) **${getDateString(this.ebReleaseDate)} CST**.\nAvailable for everyone else **${getDateString(this.releaseDate)} CST**`;
      case Batch.NORELEASE:
        return 'Available for the [Early Birds Patreon tier](https://www.patreon.com/alexanderwales) at an unknown date.\nNon-patrons will get the chapters two days later.';
      case Batch.PRERELEASE:
        return `Available for the [Early Birds Patreon tier](https://www.patreon.com/alexanderwales) **${getDateString(this.ebReleaseDate)} CST**.\nAvailable for everyone else **${getDateString(this.releaseDate)} CST**`;
      case Batch.POSTRELEASE:
        return `Batch released **${getDateString(this.ebReleaseDate)}** for the [Early Birds Patreon tier](https://www.patreon.com/alexanderwales).\n`;
      default:
        return 'You really shouldn\'t be able to see this';
    }
  }

  get embedFields() {
    const fields = [];
    const chapterListField = { name: 'Chapter list', value: this.chapterList };
    const lastBatchField = { name: 'Last batch', value: this.lastBatchString, inline: true };
    const upcomingBatchStatsField = { name: 'Upcoming batch stats', value: this.upcomingBatchStats, inline: true };
    const lastSheetUpdateField = { name: 'Last sheet update', value: this.updateDateString, inline: true };
    if (this.chapterList) fields.push(chapterListField);
    if (this.releaseStatus !== Batch.FIRSTBATCH) fields.push(lastBatchField);
    if (this.releaseStatus !== Batch.POSTRELEASE) fields.push(upcomingBatchStatsField);
    if (this.updateDateString) fields.push(lastSheetUpdateField);
    return fields;
  }

  get isNotFirst() {
    return this.number > 1;
  }

  get isNotLast() {
    return this.number < Batch.batches.length;
  }

  static daysBetween(date1, date2) {
    const oldDate = new Date(date1);
    const newDate = new Date(date2);
    const diffInTime = newDate.getTime() - oldDate.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.round(diffInTime / oneDay);
    return diffInDays;
  }

  static getFirstFutureBatch() {
    const today = new Date();
    const futureBatches = Batch.batches.filter((batch) => batch.releaseDate > today);
    if (futureBatches === []) return Batch.batches[Batch.batches.length - 1];
    return futureBatches[0]; // return first batch with a date in the future, i.e. next release
  }

  static getBatch(batchNumber = 0) {
    const baseBatch = Batch.getFirstFutureBatch();
    const seekedBatchNumber = baseBatch.number + batchNumber;
    const batchIndex = seekedBatchNumber - 1;
    if (batchIndex < 0 || batchIndex >= Batch.batches.length) {
      return baseBatch;
    }
    return Batch.batches[batchIndex];
  }

  static initializeBatchManager(sheetRows, updateDateString) {
    Batch.batches.length = 0;
    Batch.updateDateString = updateDateString;
    const chapters = [];

    let batchNumber = 1;
    let currentBatchDate = sheetRows[0][DATE_COL];
    let currentBatchEbDate = sheetRows[0][EB_DATE_COL];
    sheetRows.forEach((row) => {
      const chapterNumber = row[CHAPTER_COL];
      const chapterWords = Number(row[WORDS_COL]);
      const chapterNotes = row[NOTES_COL] === '' ? null : row[NOTES_COL];
      const chapter = new Chapter(chapterNumber, chapterWords, chapterNotes);
      const earlyDate = row[EB_DATE_COL];
      const date = row[DATE_COL];
      if (chapterNumber && chapterWords) {
        Batch.grandTotal += Number(chapterWords);
        // If date has changed, the previous chapters were a batch
        if (date && date !== currentBatchDate) {
          const batch = new Batch(batchNumber,
            new Date(currentBatchEbDate),
            new Date(currentBatchDate),
            [...chapters]);
          currentBatchDate = date;
          currentBatchEbDate = earlyDate;
          Batch.batches.push(batch);
          batchNumber += 1;
          chapters.length = 0;
        }
        chapters.push(chapter);
      }
    });
    // Push remaining dateless batch, if it exists
    if (chapters.length > 0) {
      const batch = new Batch(batchNumber, null, null, [...chapters]);
      Batch.batches.push(batch);
    }

    console.log(util.inspect(Batch.batches));
  }
}

module.exports = ({ Batch });
