const {
  POWERS, POWER_MODIFIERS, POWERM_ADJECTIVE, POWERM_PREFIX, POWERM_SUFFIX,
} = require('../config/constants');

function generatePower() {
  const butand = ['but', 'and'];
  let sentence = '';
  sentence += POWERS[Math.floor(Math.random() * POWERS.length)];
  sentence += '. Yes, ';
  sentence += butand[Math.floor(Math.random() * butand.length)];
  sentence += ' ';
  sentence += POWER_MODIFIERS[Math.floor(Math.random() * POWER_MODIFIERS.length)];
  sentence += '.';
  return sentence;
}

function generatePowerm() {
  const butand = ['but', 'and'];
  let sentence = '';
  sentence += POWERM_PREFIX[Math.floor(Math.random() * POWERM_PREFIX.length)];
  sentence += POWERM_SUFFIX[Math.floor(Math.random() * POWERM_SUFFIX.length)];
  sentence += '. Yes, ';
  sentence += butand[Math.floor(Math.random() * butand.length)];
  sentence += ' ';
  sentence += POWERM_ADJECTIVE[Math.floor(Math.random() * POWERM_ADJECTIVE.length)];
  sentence += '.';
  return sentence;
}

module.exports = ({ generatePower, generatePowerm });
