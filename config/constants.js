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
  'versatility', 'durability', 'persistence', 'transformation', 'adaptation',
  'permission', 'direction', 'intuition', 'synthesis', 'normality', 'artistry',
  'meta', 'representation', 'evidence', 'constitution', 'sets', 'wealth', 
  'recognition', 'fuel', 'immunity', 'triggers', 'grace', 'splashing', 
  'expectation', 'addiction', 'transfer', 'noise', 'sharing', 'contagion', 
  'friction', 'life', 'death', 'specific locations', 'confusion', 'fame', 
  'radiation', 'beauty', 'mimicry', 'friendship', 'divinity', 'rivalry', 
  'order', 'chaos', 'secrecy', 'health', 'fortune', 'posterity', 'leakage',
  'journey', 'destination', 'harvest', 'machinery', 'body', 'war', 'delay',
  'sea', 'sky', 'terrain', 'language', 'hunger', 'geometry', 'truth', 'cover',
  'alignment', 'mystery', 'boundaries', 'building', 'birth', 'filth', 'agreement',
  'contracts', 'obscurity', 'intoxication', 'tremors', 'cycles', 'distraction', 
  'loyalty', 'microtransactions', 'messaging', 'elevation', 'cultivation', 'vengeance',
  'patriotism', 'foundation', 'education', 'ruin', 'ambition', 'preservation',
  'honor', 'endowment', 'valor', 'invention', 'autonomy', 'whimsy', 'devotion', 
  'mercy', 'dominion', 'jurisprudence', 'debt', 'odium', 'nature', 'thought', 
  'avarice', 'willpower', 'hope', 'compassion', 'love', 'shellfish', 
  ];

const POWERM_ADJECTIVE = ['Abnormal','Accidental','Acute','Advanced','Applied','Asymptomatic','Balanced',
  'Bariatric','Behavioral','Benign','Charged','Chronic','Clinical','Somatic','Comedic','Communicable',
  'Congenital','Contractual','Crippling','Critical','Degenerative','Delayed','Depressive','Disabling',
  'Divine','Effective','Elevated','Empty','Enchanted','Entadic','Esoteric','Exclusive','Explicable',
  'Explosive','Explotable','Focal','Focused','Forgettable','Free','Fulminant','Fungal','Generalized',
  'Gentle','Global','Gygaxian','High stakes','Horrific','Hypnotic','Iconic','Idiosyncratic','Illusionary',
  'Immaterial','Immunizing','Inactive','Ineffective','Infectious','Inflammatory','Internal','Invasive',
  'Lackadaisical','Life-threatening','Local','Long-range','Low-grade','Ludicrous','Maddening','Malignant ',
  'Mild','Morbid','Mundane','Nervous','Non-specific','Opportunistic','Oppressive','Parasitic','Pathological',
  'Penetrative','Synthetic','Permanent','Persistant','Physical','Preemptive','Preparatory','Preternatural',
  'Prickly','Private','Protective','Providential','Pseudo','Psychosomatic','Public','Quiescent','Quixotic',
  'Reflexive','Refractory','Regulatory','Retroactive','Revelatory','Ritualistic','Sacrificial','Self-induced',
  'Self-inflicted','Severe','Spiritual','Spontaneous','Sporadic','Strangulated','Stubborn','Surplus','Systemic',
  'Terminal','Theoretical','Therapeutic','Transformative','Transient','Traumatic','Triggered','Unresponsive',
  'Unsightly','Vancian','Widespread'];

const POWERM_PREFIX = ['acantho','aero','agro','amo','amphi','andro','angelo','antho','anthropo','arcano',
  'arcto','argento','arithmo','arthro','aspido','astro','auro','auto','azo','biblio','bio','blasto','botano',
  'bronto','carcino','cardio','carto','chemo','chrono','cinema','cosmo','cranio','cryo','crypto','crystallo',
  'cubo','cupro','cyber','cyno','demo','demono','dendro','dermo','drama','electro','entomo','ergo','felido',
  'ferro','flori','garbo','gastro','geo','gerento','glyco','grapho','gyno','gyro','hagio','hallucino',
  'helico','helio','hemato','hippo','hydro','hypno','icthyo','info','kineto','lacto','litho','logo',
  'macro','margarito','metal','meteoro','micro','mnemo','morpho','musico','myco','myo','necro','neo',
  'nephro','neuro','numero','oculo','odonto','oneiro','oo','ophio','ornitho','osteo','oxy','paleo','pan',
  'philio','ero','phono','photo','phyto','plumbo','pseudo','psycho','ptero','pyro','retro','rhino',
  'rumpo','sarco','scato','seleno','smilo','sopho','spatula','spodo','spongo','techno','tele','tempesto',
  'thalasso','thaumato','therio','thermo','thylaco','titano','toxico','veloci','vexillo','vitreo','vulcano',
  'wumbo','xeno','xylo','zoo','zymo'];

const POWERM_SUFFIX = ['accumulation','acoustics','affinity','alteration','animacy','anthropy','aspis','banishment',
  'barriers','beams','bending','biology','blasting','business','centrism','cide','clasm','claws','cognition',
  'communication','core','cracy','craft','dactyly','dermis','detection','diffusion','embodiment','engineering',
  'extraction','fication','form','furcation','gadgetry','gamy','genesis','gravy','hazards','holism','illusions',
  'immunity','imposition','injection','kinesis','lalia','leakage','lingualism','lithy','locomotion','logy',
  'luminescence ','lurgy','lysis','machy','mageddon','magnetism','mancy','mastery','mechanisms','megaly','metry',
  'mimicry','minions','morphy','nautics','necrosis','nium','nomy','pathy','phagy','phily','phobia','phoresis',
  'plasty','plegia','poly','portals','portation','projection','ps','psychology','ptery','reflection','restoration',
  'robbery','rrhagia','rrhea','sclerosis','scopy','sensation','sis','sophy','spasms','stalsis','stasis','staxis',
  'stomy','synthesis','technics','therapy','tomy','toxicity','transfer','transit','trophy','vision','voyance','warding'];

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
  TEST_SPREADSHEET, WOG_SPREADSHEET, POWERS, POWER_MODIFIERS, EXPLANATIONS,
  POWERM_ADJECTIVE, POWERM_PREFIX, POWERM_SUFFIX }
