const Discord = require('discord.js');

function getHelpEmbed() {
  const helpEmbed = new Discord.MessageEmbed()
    .setColor('#000000')
    .setAuthor('Help message', 'https://i.imgur.com/4Y8xKdY.png')
    .setDescription(
      '**RavenBot** is designed to cater to the needs of the Alexander Wales server and provide information about his creations.\n\n '
          + "All commands can be sent via Direct Message if you don't want to spam the chat. Type / to see commands.\n\n "
          + 'If you need help regarding its use or have any feature suggestions, contact **Makin#0413**. Also, RavenBot is [open source](https://github.com/recordcrash/ravenbot).',
    );
  return helpEmbed;
}

module.exports = { getHelpEmbed };
