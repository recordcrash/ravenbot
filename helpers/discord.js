const { Permissions } = require('discord.js');

function deleteMessage(message, timeout) {
  if (message.member) { // If not inside a private message
    if (message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
      setTimeout(() => message.delete(), timeout);
    } else console.log("I tried to delete a message but I didn't have permissions");
  }
}

module.exports = { deleteMessage };
