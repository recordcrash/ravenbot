const { Chapter } = require('./chapter');

const CHAPTER_COL = 0;
const DATE_COL = 1;
const WORDS_COL = 3;
const NOTES_COL = 4;

class Batch {
  constructor(number, releaseDate, chapters) {
    this.number = Number(number);
    this.releaseDate = releaseDate;
    this.chapters = chapters;
    this.words = this.chapters.reduce((sum, { words }) => sum + words, 0);
    this.wordsPerDay = this.words / Batch.getdaysBetweenBatchStart(this.number, this.releaseDate);
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

  static getdaysBetweenBatchStart(batchNumber, releaseDate) {
    let firstDate = new Date('2021-07-04');
    const lastDate = releaseDate || new Date();
    if (batchNumber > 1) firstDate = Batch.batches[batchNumber - 2].releaseDate;
    const days = Batch.daysBetween(firstDate, lastDate);
    return days;
  }

  static lastBatch() {
    return Batch.batches.slice(-1)[0];
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

  static nextReleaseDate() {
    return Batch.lastBatch().releaseDate || 'Never';
  }

  static daysBetween(date1, date2) {
    const oldDate = new Date(date1);
    const newDate = new Date(date2);
    const diffInTime = newDate.getTime() - oldDate.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.round(diffInTime / oneDay);
    return diffInDays;
  }

  static getLastBatchString() {
    if (Batch.globalStatus === Batch.FIRSTBATCH) return 'No previous batches found!';
    const daysBetween = Batch.daysBetween(Batch.lastUpdateDate(), new Date());
    const pluralString = (daysBetween === 1 || daysBetween === -1) ? '' : 's';
    if (daysBetween > 0) return `**${Batch.lastUpdateDate()}** (${daysBetween} day${pluralString} ago)`;
    return `**${Batch.lastUpdateDate()}** (${daysBetween * -1} day${pluralString} from now)`;
  }

  static getUpcomingBatchStats() {
    return `${Batch.lastBatch().words} words, ${Batch.lastBatch().wordsPerDay.toPrecision(6)}/day`;
  }

  static getChapterList() {
    let chapterListString = '';
    Batch.lastBatch().chapters.forEach((chapter) => {
      const notesString = chapter.notes ? ` (${chapter.notes})` : '';
      chapterListString += `Chapter ${chapter.number}: ${chapter.words} words${notesString}\n`;
    });
    return chapterListString;
  }

  static initializeGlobalStatus() {
    const today = new Date();
    console.log(today);
    console.log(Batch.batches);
    console.log(Batch.batches.length);
    if (Batch.batches.length < 2) Batch.globalStatus = Batch.FIRSTBATCH;
    else if (!Batch.lastBatch().releaseDate) Batch.globalStatus = Batch.NORELEASE;
    else if (Batch.daysBetween(Batch.lastBatch().releaseDate, today) < 1) {
      Batch.globalStatus = Batch.PRERELEASE;
    } else Batch.globalStatus = Batch.POSTRELEASE;
  }

  static getEmbedTitle() {
    switch (Batch.globalStatus) {
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

  static getEmbedDescription() {
    switch (Batch.globalStatus) {
      case Batch.FIRSTBATCH:
      case Batch.NORELEASE:
        return 'Available for the [Early Birds Patreon tier](https://www.patreon.com/alexanderwales) at an unknown date.\nNon-patrons will get the chapters two days later.';
      case Batch.PRERELEASE:
        return `Available for the [Early Birds Patreon tier](https://www.patreon.com/alexanderwales) **${Batch.nextReleaseDate()}**.\nNon-patrons will get the chapters two days later.`;
      case Batch.POSTRELEASE:
        return `Last available batch released **${Batch.lastUpdateDate()}** for the [Early Birds Patreon tier](https://www.patreon.com/alexanderwales).\n`;
      default:
        return 'You really shouldn\'t be able to see this';
    }
  }

  static getEmbedFields() {
    const fields = [];
    const chapterListField = { name: 'Chapter list', value: Batch.getChapterList() };
    const lastBatchField = { name: 'Last batch', value: Batch.getLastBatchString(), inline: true };
    const upcomingBatchStatsField = { name: 'Upcoming batch stats', value: Batch.getUpcomingBatchStats(), inline: true };
    const lastSheetUpdateField = { name: 'Last sheet update', value: Batch.updateDateString, inline: true };
    const batchStatus = Batch.globalStatus;
    if (Batch.getChapterList()) fields.push(chapterListField);
    if (batchStatus !== Batch.FIRSTBATCH) fields.push(lastBatchField);
    if (batchStatus !== Batch.POSTRELEASE) {
      fields.push(upcomingBatchStatsField);
    }
    if (Batch.updateDateString) fields.push(lastSheetUpdateField);
    return fields;
  }

  static initializeBatchManager(sheetRows, updateDateString) {
    Batch.updateDateString = updateDateString;
    const chapters = [];

    let batchNumber = 1;
    sheetRows.forEach((row) => {
      const chapterNumber = row[CHAPTER_COL];
      const chapterWords = row[WORDS_COL];
      const chapterNotes = row[NOTES_COL] === '' ? null : row[NOTES_COL];
      const chapter = new Chapter(chapterNumber, chapterWords, chapterNotes);
      const batchDate = row[DATE_COL];
      if (chapterNumber && chapterWords) {
        chapters.push(chapter);
        if (batchDate && batchDate !== '') {
          const batch = new Batch(batchNumber, new Date(batchDate), [...chapters]);
          Batch.batches.push(batch);
          batchNumber += 1;
          chapters.length = 0;
        }
        Batch.grandTotal += chapterWords;
      }
    });
    // Push remaining dateless batch, if it exists
    if (chapters.length > 0) {
      const batch = new Batch(batchNumber, null, [...chapters]);
      Batch.batches.push(batch);
    }
    Batch.initializeGlobalStatus();
  }
}

module.exports = ({ Batch });
