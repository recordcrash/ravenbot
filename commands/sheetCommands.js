const Discord = require('discord.js');

function getProgressFromSheet(res, message, storage, numbersUp, command) {
  let localNumbersUp = numbersUp;
  const rows = res.data.values;
  if (rows.length) {
    let batchRow = 0;
    let chapterRow = 0;
    let metadataRow = 0;
    const batches = rows.map((value) => value[1]);
    for (let i = batches.length - 1; i > 0; i -= 1) {
      if (batches[i]) {
        batchRow = i;
        break;
      }
    }
    const chapters = rows.map((value) => value[0]);
    for (let j = chapters.length - 1; j > 0; j -= 1) {
      if (chapters[j]) {
        chapterRow = j;
        break;
      }
    }

    const metadata = rows.map((value) => value[5]);
    for (let k = metadata.length - 1; k > 0; k -= 1) {
      if (metadata[k] && metadata[k] > 0) {
        metadataRow = k;
        break;
      }
    }

    const wordsPer = metadata[metadataRow];
    const totalWords = metadata[metadataRow - 1];
    const daysSince = metadata[metadataRow - 2];

    if (message.member) {
      const totaldata = rows.map((value) => value[8]);
      const grandTotal = totaldata[metadataRow];
      console.log(`Grand total is: ${grandTotal}`);

      if (storage.getItemSync('grandtotal') !== grandTotal) {
        const dateOb = new Date();
        const date = (`0${dateOb.getDate()}`).slice(-2);
        const month = (`0${dateOb.getMonth() + 1}`).slice(-2);
        const year = dateOb.getFullYear();
        const hours = (`0${dateOb.getHours()}`).slice(-2);
        const minutes = (`0${dateOb.getMinutes()}`).slice(-2);
        const seconds = (`0${dateOb.getSeconds()}`).slice(-2);
        const finalDate = `${hours}:${minutes}:${seconds} ${month}/${date}/${year}`;
        storage.setItemSync('updateDate', finalDate);
        console.log(`Sheet updated: update date: ${finalDate}`);
      }
      if (storage.getItemSync('grandtotal') < grandTotal) {
        localNumbersUp = true;
        console.log(`Numbers went up! New grand total: ${grandTotal}`);
      }
      // We store the grand total in case numbers actually went down
      storage.setItemSync('grandtotal', grandTotal);
    }

    // Format fucked for some reason, only if AW puts something in the date
    // field where he shouldn't
    if (chapterRow - batchRow < 0) {
      message.channel.send(
        'Error fetching chapters from the spreadsheet (Wrong format?).',
      );
      // Special case: batch ready and upcoming, or already out with no progress
    } else if (chapterRow - batchRow === 0) {
      let specialRow = 0;
      for (let l = batchRow - 1; l > 0; l -= 1) {
        if (batches[l]) {
          specialRow = l;
          break;
        }
      }
      const newdate = batchRow;
      batchRow = specialRow;
      let chapterList = '';

      rows.slice(batchRow + 1, chapterRow + 1).forEach((row) => {
        if (row[3]) {
          chapterList
                += `Chapter ${row[0]}: ${row[2]} words (${row[3]})\n`;
        } else chapterList += `Chapter ${row[0]}: ${row[2]} words\n`;
      });

      const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#E5D2A0')
        .setTitle('Finished batch information')
        .setDescription(
          `Available for the Early Birds Patreon tier **${
            batches[newdate]
          }**.\nNon-patrons will get the chapters one day later.`,
        )
        .setURL(
          'https://docs.google.com/spreadsheets/d/1PaLrwVYgxp_SYHtkred7ybpSJPHL88lf4zB0zMKmk1E',
        )
        .setAuthor(
          'Worth the Candle',
          'https://i.imgur.com/qyPZoAw.png',
          'https://www.royalroad.com/fiction/25137/worth-the-candle',
        )
        .addFields(
          { name: 'Chapter list', value: chapterList },
          {
            name: 'Batch stats',
            value: `${totalWords} words, ${wordsPer}/day`,
            inline: true,
          },
        );
      message.channel.send(exampleEmbed);
      // End of special case, I hate myself for this hackery
    } else {
      let chapterList = '';
      rows.slice(batchRow + 1, chapterRow + 1).forEach((row) => {
        if (row[3]) {
          chapterList
                += `Chapter ${row[0]}: ${row[2] || 0} words (${row[3]})\n`;
        } else chapterList += `Chapter ${row[0]}: ${row[2]} words\n`;
      });

      const progressEmbed = new Discord.MessageEmbed()
        .setColor('#E5D2A0')
        .setTitle('Upcoming chapter progress')
        .setURL(
          'https://docs.google.com/spreadsheets/d/1PaLrwVYgxp_SYHtkred7ybpSJPHL88lf4zB0zMKmk1E',
        )
        .setAuthor(
          'Worth the Candle',
          'https://i.imgur.com/qyPZoAw.png',
          'https://www.royalroad.com/fiction/25137/worth-the-candle',
        )
        .addFields(
          { name: 'Chapter list', value: chapterList },
          {
            name: 'Last batch',
            value: `${batches[batchRow]} (${daysSince} days ago)`,
            inline: true,
          },
          {
            name: 'Upcoming batch stats',
            value: `${totalWords} words, ${wordsPer}/day`,
            inline: true,
          },
          {
            name: 'Last sheet update',
            value: storage.getItemSync('updateDate') || 'No value yet!',
            inline: true,
          },
        );
      if (command === 'pogress' || command === 'pog') {
        progressEmbed
          .setTitle('Upcoming chapter pogress')
          .setAuthor(
            'Worth the Candle',
            'https://i.imgur.com/Sikw7S2.png',
            'https://www.royalroad.com/fiction/25137/worth-the-candle',
          );
      }
      if (command === 'regress') {
        progressEmbed.fields = [];
        progressEmbed.addFields(
          { name: 'Chapter list', value: 'Chapter 1: 0 words' },
          {
            name: 'Last batch',
            value: `January 1st (${9999} days ago)`,
            inline: true,
          },
          {
            name: 'Upcoming batch stats',
            value: `${0} words, ${0}/day`,
            inline: true,
          },
        );
        progressEmbed.setTitle('Upcoming chapter "progress"');
      }

      message.channel.send(progressEmbed).then((sent) => {
        // React if numbers went up
        if (localNumbersUp === true) {
          sent.react('758041474335113397');
          localNumbersUp = false;
        }
      });
    }
  } else {
    console.log('No data found.');
    message.channel.send('Error contacting the server.');
  }
  return true;
}

module.exports = { getProgressFromSheet };
