const Discord = require('discord.js');
const { Batch } = require('../classes/batch');
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

function buildNextChapterEmbed() {
  const embed = new Discord.MessageEmbed()
    .setColor(PROGRESS_EMBED_COLOR)
    .setTitle(Batch.getEmbedTitle())
    .setDescription(Batch.getEmbedDescription())
    .setURL(
      'https://docs.google.com/spreadsheets/d/1K9hOvGMlydZ-9voY6FAFUyi_-cVd0ZxROoC3PD432dw',
    )
    .setAuthor(
      'This Used To Be About Dungeons',
      IMAGE_URLS.DUNGEONS,
      'https://www.royalroad.com/fiction/25137/worth-the-candle',
    )
    .addFields(Batch.getEmbedFields());
  return embed;
}

function getProgressFromSheet(res, message, storage) {
  const rows = res.data.values;
  if (rows.length) {
    const updateDateString = storage.getItemSync('updateDate') || 'No value yet!';

    Batch.initializeBatchManager(rows, updateDateString);

    const embed = buildNextChapterEmbed();

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } }).then((sent) => {
      // React if numbers went up, but only outside private messages
      if (message.member) handleGrandTotal(storage, sent);
    });
  } else {
    console.log('No data found.');
    message.channel.send('Error contacting the server.');
  }
  return true;
}

function getWogFromSheet(res, message) {
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
    message.reply({ embeds: [wogEmbed] });
  }
}

module.exports = { getProgressFromSheet, getWogFromSheet };
