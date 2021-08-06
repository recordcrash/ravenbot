/* eslint-disable no-restricted-syntax */
const { SERVER_IDS } = require('../helpers/constants');

async function initializeCommands(client) {
  console.log('Initializing commands...');
  const wtcCommands = [
    {
      name: 'help',
      description: 'Shows an explanation of what the bot does, plus credits',
    },
    {
      name: 'progress',
      description: 'Shows the current progress of the next TUTBAD batch of chapters',
    },
    {
      name: 'digress',
      description: 'Outputs a WOG (Word of God) by Alexander Wales',
    },
    {
      name: 'explain',
      description: 'Given a story\'s acronym, outputs its full name and link',
      options: [{
        name: 'acronym',
        type: 'STRING',
        description: 'A story\'s acronym',
        required: true,
      }],
    },
    {
      name: 'power',
      description: 'Outputs a random Alexander Walesque superpower with a drawback',
      options: [{
        name: 'method',
        type: 'STRING',
        description: 'Power generation method',
        required: false,
        choices: [
          {
            name: 'Alexander Wales method (based on real powers)',
            value: 'default',
          },
          {
            name: 'Bacontime method (based on auto-generated words)',
            value: 'bacontime',
          },
        ],
      }],
    },
    {
      name: 'getrole',
      description: 'Gives you a notifications role',
      options: [{
        name: 'role',
        type: 'STRING',
        description: 'The role you want',
        required: true,
        choices: [
          {
            name: 'The Flower That Bloomed Nowhere (new chapters)',
            value: 'flower',
          },
          {
            name: 'Alexander Wales\' Rationally Writing podcast (new episodes)',
            value: 'podcast',
          },
        ],
      }],
    },
  ];
  await client.guilds.cache.get(SERVER_IDS.TESTSERVER)?.commands.set(wtcCommands);
  const commands = await client.application?.commands.set(wtcCommands);
  console.log(commands);
}

module.exports = { initializeCommands };
