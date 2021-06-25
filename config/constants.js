const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = './config/token.json';

// Channel ids where the bot cannot output messages
const BANNED_CHANNEL_IDS = [
  '4376950374014648540',
  '437696073293758484',
  '437696154424311830',
  '437698440428912670',
  '446115886349156352',
  '674015083365662750',
  '449360598594093066',
  '511684577505574923',
  '516008671206047776',
  '739790983876575323',
];

const WORDS_SPREADSHEET = '1PaLrwVYgxp_SYHtkred7ybpSJPHL88lf4zB0zMKmk1E';
const TEST_SPREADSHEET = '1XIN9kXAQRKqwrlyDRXk4L56AwZoYaIR_0hjoJJ7Ab-g';
const WOG_SPREADSHEET = '1VHV6cOq_Gw5y9mOlHmge42t8lvIssrSzK7jWrSqN8qQ';

const POWERS = ['Telekinesis', 'Water manipulation', 'Fire manipulation',
  'Earth manipulation', 'Air manipulation', 'Telekinesis', 'Teleportation',
  'Super speed', 'Super strength', 'Emotional manipulation', 'Cloning',
  'Precognition', 'Clairvoyance', 'Lasers', 'Invisibility', 'Shapeshifting',
  'Flight', 'Electric manipulation', 'Telepathy', 'Regeneration', 'Healing',
  'Memory manipulation', 'Time travel', 'Illusions', 'Animal control', 'Portals',
  'Probabilty manipulation', 'Shields', 'Plant manipulation',
  'Sound manipulation', 'Summoning', 'Knowledge', 'Gravity manipulation',
  'Meta powers', 'Intangibility', 'Technopathy', 'Gadget creation',
  'Crystal manipulation', 'Flow manipulation', 'Cryokinesis', 'Space manipulation',
  'Physiological adaptation', 'Venomous physiology', 'Quills', 'Gas breath',
  'Slime manipulation', 'Force manipulation', 'Mind control', 'Time manipulation',
  'Disintegration', 'Subspace generation', 'Weapons', 'Armor', 'Acid manipulation',
  'Vapor manipulation', 'Weather manipulation', 'Matter generation',
  'Biology manipulation', 'Enhanced perception', 'Light manipulation',
  'Metal manipulation', 'Size alteration', 'Transformation',
  'Matter annihilation', 'Invulnerability', 'Mutation'];

const POWER_MODIFIERS = ['time', 'absorption', 'movement', 'charging',
  'heat', 'happiness', 'fear', 'metabolism', 'theft', 'repetition', 'isolation',
  'crowds', 'mass', 'velocity', 'feedback', 'equivalence', 'age', 'range',
  'duration', 'insanity', 'memory', 'pain', 'self', 'sleep', 'visible mutation',
  'control', 'precision', 'scale', 'instability', 'knowledge', 'damage', 'speed',
  'versatility', 'durability', 'persistence', 'transformation', 'adaptation'];

const EXPLANATIONS = {
  'OVDT': {
    name: 'Only Villains Do That',
    link: 'https://www.royalroad.com/fiction/40182'
  },
  'TFTBN': {
    name: 'The Flower that Bloomed Nowhere',
    link: 'https://www.royalroad.com/fiction/28806',
    message: 'Spoiler discussion in #flower channel'
  },
  'FTBN': {
    name: 'The Flower that Bloomed Nowhere',
    link: 'https://www.royalroad.com/fiction/28806',
    message: 'Spoiler discussion in #flower channel'
  },
  'FLOWER': {
    name: 'The Flower that Bloomed Nowhere',
    link: 'https://www.royalroad.com/fiction/28806',
    message: 'Spoiler discussion in #flower channel'
  },
  'FLWR': {
    name: 'The Flower that Bloomed Nowhere',
    link: 'https://www.royalroad.com/fiction/28806',
    message: 'Spoiler discussion in #flower channel'
  },
  'BOC': {
    name: 'Beware of Chicken',
    link: 'https://www.royalroad.com/fiction/39408'
  },
  'BWOCK': {
    name: 'Beware of Chicken',
    link: 'https://www.royalroad.com/fiction/39408'
  },
  'BWOC': {
    name: 'Beware of Chicken',
    link: 'https://www.royalroad.com/fiction/39408'
  },
  'BAWK': {
    name: 'Beware of Chicken',
    link: 'https://www.royalroad.com/fiction/39408'
  },
  'EE': {
    name: 'The Elemental Arena',
    link: 'https://www.royalroad.com/fiction/27800'
  },
  'EA': {
    name: 'The Elemental Arena',
    link: 'https://www.royalroad.com/fiction/27800'
  },
  'DDC': {
    name: 'Dungeon Crawler Carl',
    link: 'https://www.royalroad.com/fiction/29358'
  },
  'DCC': {
    name: 'Dungeon Crawler Carl',
    link: 'https://www.royalroad.com/fiction/29358'
  },
  'OWP': {
    name: 'The Optimised Wish Project',
    link: 'https://www.fanfiction.net/s/12863641'
  },
  'CK': {
    name: 'Castle Kingside',
    link: 'https://www.royalroad.com/fiction/43462'
  },
  'HWFWM': {
    name: 'He who Fights with Monsters',
    link: 'https://www.royalroad.com/fiction/26294'
  },
  'TINTF': {
    name: 'There is Nothing to Fear',
    link: 'https://www.archiveofourown.org/series/1087368'
  },
  'WTC': {
    name: 'Worth the Candle',
    link: 'https://www.royalroad.com/fiction/25137'
  },
  'TGAB': {
    name: 'The Gods are Bastards',
    link: 'https://tiraas.net/'
  },
  'GBG': {
    name: 'Game By God',
    link: 'Unfortunately, no links are available for this lost Remy serial.'
  },
  'POKESEKAI': {
    name: 'Borne of Caution',
    link: 'https://forums.spacebattles.com/threads/borne-of-caution-pokemon-isekai.849292/'
  },
  'PGTE': {
    name: 'A Practical Guide to Evil',
    link: 'https://practicalguidetoevil.wordpress.com/'
  },
  'APGTE': {
    name: 'A Practical Guide to Evil',
    link: 'https://practicalguidetoevil.wordpress.com/'
  },
  'HPMOR': {
    name: 'Harry Potter and the Methods of Rationality',
    link: 'http://daystareld.com/hpmor-remix/'
  },
  'MOR': {
    name: 'Harry Potter and the Methods of Rationality',
    link: 'http://daystareld.com/hpmor-remix/'
  },
}

module.exports = { SCOPES, TOKEN_PATH, BANNED_CHANNEL_IDS, WORDS_SPREADSHEET, 
  TEST_SPREADSHEET, WOG_SPREADSHEET, POWERS, POWER_MODIFIERS, EXPLANATIONS }
