class Chapter {
  constructor(number, words = 0, notes = null) {
    this.number = Number(number);
    this.words = Number(words);
    this.notes = notes;
  }
}

module.exports = ({ Chapter });
