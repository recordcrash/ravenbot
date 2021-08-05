const Discord = require('discord.js');

function getHelpEmbed() {
  const helpEmbed = new Discord.MessageEmbed()
    .setColor('#000000')
    .setAuthor('Help message', 'https://i.imgur.com/4Y8xKdY.png')
    .setDescription(
      'RavenBot is designed to cater to the needs of the Alexander Wales server and provide information about his creations. '
          + "All commands can be sent via Direct Message if you don't want to spam the chat. "
          + 'If you need help regarding its use or have any feature suggestions, contact **Makin#0413**.\n\n'
          + '**Command List:**',
    )
    .addFields(
      { name: '+help', value: 'Displays this message.' },
      { name: '+ping', value: 'Pings the bot to check its online status.' },
      {
        name: '+progress/+p',
        value:
            'Shows the current progress of the next This Used to be About Dungeons batch of chapters. Please use in #bot-ez.',
      },
      { name: '+explain/+e', value: 'Given a story\'s acronym, outputs its full name and link. Full list can be accessed with "all" as an argument.' },
      {
        name: '+podcast',
        value:
            'Adds the role Rationally Writing to the user, in order to be reminded of new AW podcast releases. Use again to remove.',
      },
      {
        name: '+flower',
        value:
            'Adds the role ´Flower´ to the user, in order to receive warnings that a new chapter has dropped in #flower. Use again to remove.',
      },
      { name: '+power', value: 'Outputs a random Alexander Walesque superpower with a drawback. +powerm is an alternate version by Bacontime which generates more obtuse powers.' },
    );
  return helpEmbed;
}

module.exports = { getHelpEmbed };
