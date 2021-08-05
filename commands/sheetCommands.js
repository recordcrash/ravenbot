const Discord = require('discord.js');
const util = require('util');
const { Batch } = require('../classes/batch');
const { IMAGE_URLS, PROGRESS_EMBED_COLOR } = require('../config/constants');

function getCurrentDateString() {
  const dateOb = new Date();
  const date = (`0${dateOb.getDate()}`).slice(-2);
  const month = (`0${dateOb.getMonth() + 1}`).slice(-2);
  const year = dateOb.getFullYear();
  const hours = (`0${dateOb.getHours()}`).slice(-2);
  const minutes = (`0${dateOb.getMinutes()}`).slice(-2);
  const seconds = (`0${dateOb.getSeconds()}`).slice(-2);
  const finalDate = `${hours}:${minutes}:${seconds} ${month}/${date}/${year}`;
  return finalDate;
}

function handleGrandTotal(storage, message) {
  const { grandTotal } = Batch;
  console.log(`Grand total is: ${grandTotal}`);

  if (storage.getItemSync('grandtotal') !== grandTotal) {
    const currentDate = getCurrentDateString();
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
    console.log(util.inspect(Batch.batches, false, null, true));
    console.log(Batch.globalStatus);

    const embed = buildNextChapterEmbed();

    message.channel.send(embed).then((sent) => {
      // React if numbers went up, but only outside private messages
      if (message.member) handleGrandTotal(storage, sent);
    });
  } else {
    console.log('No data found.');
    message.channel.send('Error contacting the server.');
  }
  return true;
}

module.exports = { getProgressFromSheet };
