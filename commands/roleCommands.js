function giveRoleToUser(message, command) {
  let rolename = 'Role name';
  let addmsg = `\`${rolename}\` role added successfully.`;
  switch (command) {
    case 'podcast':
      rolename = 'Rationally Writing';
      addmsg = `\`${rolename}\` role added successfully. Listen to the podcast at <http://daystareld.com/podcasts/rationally-writing/>`;
      break;
    case 'flower':
      rolename = 'Flower';
      addmsg = `\`${rolename}\` role added successfully. Read the story at <https://www.royalroad.com/fiction/28806> and discuss it in #flower.`;
      break;
    default:
      break;
  }
  if (message.member) {
    const role = message.guild.roles.cache.find((rol) => rol.name === rolename);
    if (role) {
      if (!message.member.roles.cache.some((rol) => rol.name === rolename)) {
        // If user doesn't have the role, add it
        message.member.roles.add(role);
        message.reply({ content: addmsg });
      } else {
        // If the user already has the role, remove it
        message.member.roles.remove(role);
        message.reply({ content: `\`${rolename}\` role removed successfully.` });
      }
    }
    message.reply({ content: 'The role you\'re looking for doesn\'t exist. Trust me, I\'ve been there.' });
  } else message.reply({ content: 'You need more Degrees of Reasonableness in order to use this command in a Direct Message.' });
}

module.exports = { giveRoleToUser };
