const Discord = require('discord.js');
const { Batch } = require('../classes/batch');
const { StatDay } = require('../classes/statDay');
const { IMAGE_URLS, PROGRESS_EMBED_COLOR } = require('../helpers/constants');
const { getDateTimeString } = require('../helpers/dates');

function handleGrandTotal(storage, message) {
  const grandTotal = Number(Batch.grandTotal);
  console.log(`Grand total is: ${grandTotal}`);

  if (storage.getItemSync('grandtotal') !== grandTotal) {
    const currentDate = getDateTimeString(new Date());
    storage.setItemSync('updateDate', currentDate);
    console.log(`Sheet updated: update date: ${currentDate}`);
  }
  if (storage.getItemSync('grandtotal') < grandTotal) {
    console.log(`Numbers went up! New grand total: ${grandTotal}`);
    message.react('758041474335113397');
  }
  // We store the grand total in case numbers actually went down
  storage.setItemSync('grandtotal', grandTotal);
}

function buildBatchEmbed(batch) {
  const embed = new Discord.MessageEmbed()
    .setColor(PROGRESS_EMBED_COLOR)
    .setTitle(batch.embedTitle)
    .setDescription(batch.embedDescription)
    .setURL(
      'https://docs.google.com/spreadsheets/d/1K9hOvGMlydZ-9voY6FAFUyi_-cVd0ZxROoC3PD432dw',
    )
    .setAuthor(
      'This Used To Be About Dungeons',
      IMAGE_URLS.DUNGEONS,
      'https://www.royalroad.com/fiction/45534/this-used-to-be-about-dungeons',
    )
    .addFields(batch.embedFields);
  return embed;
}

function getBatchEmbed(batch) {
  const embed = buildBatchEmbed(batch);
  return embed;
}

function getBatchComponents(batch) {
  const components = [];

  const previousButton = new Discord.MessageButton()
    .setCustomId('previousButton')
    .setStyle('PRIMARY')
    .setLabel('◀');

  const previousButtonDisabled = new Discord.MessageButton()
    .setCustomId('previousButtonDisabled')
    .setStyle('PRIMARY')
    .setLabel('◀')
    .setDisabled(true);

  const nextButton = new Discord.MessageButton()
    .setCustomId('nextButton')
    .setStyle('PRIMARY')
    .setLabel('▶');

  const nextButtonDisabled = new Discord.MessageButton()
    .setCustomId('nextButton')
    .setStyle('PRIMARY')
    .setLabel('▶')
    .setDisabled(true);

  components.push(batch.isNotFirst ? previousButton : previousButtonDisabled);
  components.push(batch.isNotLast ? nextButton : nextButtonDisabled);
  return components;
}

function getBatchRow(batch) {
  return new Discord.MessageActionRow({ components: getBatchComponents(batch) });
}

function getProgressFromSheet(res, interaction, storage) {
  const rows = res.data.values;
  if (rows.length) {
    const updateDateString = storage.getItemSync('updateDate') || 'No value yet!';

    let currentBatchPosition = 0;

    Batch.initializeBatchManager(rows, updateDateString);
    let batch = Batch.getBatch(currentBatchPosition);
    const embed = getBatchEmbed(batch);

    interaction.reply({
      embeds: [embed],
      components: [getBatchRow(batch)],
      allowedMentions: { repliedUser: false },
    }).then((sent) => {
      // React if numbers went up, but only outside private messages
      if (interaction.member && sent) handleGrandTotal(storage, sent);

      // Handle button interactions
      const filter = (i) => i.customId === 'previousButton' || i.customId === 'nextButton';

      const collector = interaction.channel.createMessageComponentCollector(
        { filter, time: 150000 },
      );

      collector.on('collect', async (i) => {
        if (i.customId === 'previousButton') {
          currentBatchPosition -= 1;
          batch = Batch.getBatch(currentBatchPosition);
          await i.update({
            embeds: [getBatchEmbed(batch)],
            components: [getBatchRow(batch)],
          });
        }
        if (i.customId === 'nextButton') {
          currentBatchPosition += 1;
          batch = Batch.getBatch(currentBatchPosition);
          await i.update({
            embeds: [getBatchEmbed(batch)],
            components: [getBatchRow(batch)],
          });
        }
      });

      collector.on('end', () => interaction.editReply({
        embeds: [getBatchEmbed(batch)],
        components: [],
      }));
    });
  } else {
    console.log('No data found.');
    interaction.reply('Error contacting the server.');
  }
  return true;
}

function getStatsFromSheet(res, interaction) {
  const rows = res.data.values;
  if (rows.length) {
    StatDay.initializeStatsManager(rows);
    interaction.reply({ files: [{ attachment: StatDay.getChartUrl(), name: 'chart.png' }] });
  }
}

function getWogFromSheet(res, interaction) {
  const rows = res.data.values;
  if (rows.length) {
    const wogs = rows.map((value) => value[0]);
    const links = rows.map((value) => value[1]);
    const randomIndex = Math.floor(Math.random() * wogs.length);
    const wogEmbed = new Discord.MessageEmbed()
      .setColor('#A4DACC')
      .setAuthor('Alexander Wales', 'https://www.royalroadcdn.com/public/avatars/avatar-119608.png')
      .setDescription(wogs[randomIndex]);
    if (links[randomIndex]) { wogEmbed.addFields({ name: 'Link', value: links[randomIndex].match(/=hyperlink\("([^"]+)"/i) ? links[randomIndex].match(/=hyperlink\("([^"]+)"/i)[1] : 'Error fetching link' }); }
    interaction.reply({ embeds: [wogEmbed] });
  }
}

module.exports = { getProgressFromSheet, getWogFromSheet, getStatsFromSheet };
