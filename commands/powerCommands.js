const {
  POWERS, POWER_MODIFIERS, POWERM_ADJECTIVE, POWERM_PREFIX, POWERM_SUFFIX,
} = require('../helpers/constants');

const { OBJECTS } = require('../helpers/objects');
const { ADJECTIVES } = require('../helpers/adjectives');

function fetchRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function capitalizeAllWords(string) {
  return string.replace(/(^\w{1})|(\s{1}\w{1})/g, (match) => match.toUpperCase());
}

function generatePower() {
  const butand = ['but', 'and'];
  let sentence = '';
  sentence += fetchRandom(POWERS);
  sentence += '. Yes, ';
  sentence += fetchRandom(butand);
  sentence += ' ';
  sentence += fetchRandom(POWER_MODIFIERS);
  sentence += '.';
  return sentence;
}

function generatePowerm() {
  const butand = ['but', 'and'];
  let sentence = '';
  sentence += fetchRandom(POWERM_PREFIX);
  sentence += fetchRandom(POWERM_SUFFIX);
  sentence += '. Yes, ';
  sentence += fetchRandom(butand);
  sentence += ' ';
  sentence += fetchRandom(POWERM_ADJECTIVE);
  sentence += '.';
  return sentence;
}

function generateEntad() {
  const adjective = fetchRandom(ADJECTIVES);
  const item = fetchRandom(OBJECTS);
  return `${capitalizeAllWords(adjective)} ${capitalizeAllWords(item)}`;
}

module.exports = ({ generatePower, generatePowerm, generateEntad });
