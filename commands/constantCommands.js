const { EXPLANATIONS } = require('../helpers/constants');

function explainCommand(interaction) {
  const explained = interaction.options.getString('acronym');
  if (explained.toUpperCase() === 'ALL' || explained === '*' || explained === '') {
    interaction.reply({ content: 'The full list of works available to this command is located at <https://discord.com/channels/437695037401464851/437697099383963668/848202602688282655>.' });
  } else if (explained.toUpperCase() in EXPLANATIONS) {
    const story = EXPLANATIONS[explained.toUpperCase()];
    interaction.reply({ content: `I've found something called ***${story.name}***. Is this what you were looking for? ${story.link}` });
  } else interaction.reply({ content: 'I can\'t find that story among my 32768 books.' });
}

module.exports = { explainCommand };
