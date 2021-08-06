function giveRoleToUser(interaction) {
  const role = interaction.options.getString('role');
  console.log(role);
  let rolename = 'Role name';
  let addmsg = `\`${rolename}\` role added successfully.`;
  switch (role) {
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
  if (interaction.member) {
    const role = interaction.guild.roles.cache.find((rol) => rol.name === rolename);
    if (role) {
      if (!interaction.member.roles.cache.some((rol) => rol.name === rolename)) {
        // If user doesn't have the role, add it
        interaction.member.roles.add(role);
        interaction.reply({ content: addmsg });
      } else {
        // If the user already has the role, remove it
        interaction.member.roles.remove(role);
        interaction.reply({ content: `\`${rolename}\` role removed successfully.` });
      }
    }
    interaction.reply({ content: 'The role you\'re looking for doesn\'t exist.' });
  } else interaction.reply({ content: 'You need more Degrees of Reasonableness in order to use this command in a Direct Message.' });
}

module.exports = { giveRoleToUser };
