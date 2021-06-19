/* eslint-disable global-require */
/* eslint-disable no-console */
// **RavenBot Main Loop**
// Credits:
// Modified version of eslachance's "The Perfect Lil' Bot" https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3
// Modified version of Federico Grandi's cron solution to time checking in https://stackoverflow.com/a/53822507
// Everything else by Makin

const {
  SCOPES, TOKEN_PATH, BANNED_CHANNEL_IDS, WORDS_SPREADSHEET, WOG_SPREADSHEET, POWERS,
  POWER_MODIFIERS, EXPLANATIONS, POWERM_ADJECTIVE, POWERM_PREFIX, POWERM_SUFFIX
} = require('./config/constants.js');

const Discord = require('discord.js');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const cron = require('cron');
const http = require('http');
const TurndownService = require('turndown');
const storage = require('node-persist');

// eslint-disable-next-line no-var
var numbersUp = false;

// Persistent storage for grand total
storage.initSync();

function generatePower() {
  const butand = ['but', 'and'];
  let sentence = '';
  sentence += POWERS[Math.floor(Math.random() * POWERS.length)];
  sentence += '. Yes, ';
  sentence += butand[Math.floor(Math.random() * butand.length)];
  sentence += ' ';
  sentence += POWER_MODIFIERS[Math.floor(Math.random() * POWER_MODIFIERS.length)];
  sentence += '.';
  return sentence;
}

function generatePowerm() {
  let sentence = '';
  sentence += POWERM_ADJECTIVE[Math.floor(Math.random() * POWERM_ADJECTIVE.length)];
  sentence += ' ';
  sentence += POWERM_PREFIX[Math.floor(Math.random() * POWERM_PREFIX.length)];
  sentence += POWERM_SUFFIX[Math.floor(Math.random() * POWERM_SUFFIX.length)];
  return sentence;
}

function downloadHTML() {
  // This function downloads the entire story every day so you can search it
  console.log('Attempting to download html');
  const download = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    http.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        console.log('HTML downloaded successfully');
        file.close(cb);
      });
    }).on('error', (err) => {
      // Handle errors
      console.log(`Error downloading HTML file: ${err.message}`);
      fs.unlink(dest);
      if (cb) cb(err.message);
    });
  };

  download(
    'http://download.archiveofourown.org/downloads/11478249/Worth%20the%20Candle.html',
    'files/wtc.html',
  );
}

const downloadTask = new cron.CronJob('13 00 00 * * *', downloadHTML);

// eslint-disable-next-line func-names
const grep = function (what, where, callback) {
  const { exec } = require('child_process');
  exec(
    `grep "${what.replace(/"/g, '\\"')}" ${where} -hiw -m 5`,
    (err, stdin) => {
      const results = stdin.split('\n').slice(0, 10);
      callback(results);
    },
  );
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error(
          'Error while trying to retrieve access token',
          err,
        );
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (writeError) => {
        if (writeError) return console.error(writeError);
        console.log('Token stored to', TOKEN_PATH);
        return true;
      });
      callback(oAuth2Client);
      return true;
    });
  });
}

function authorize(credentials, callback) {
  // eslint-disable-next-line camelcase
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
    return true;
  });
}

// starting turndown to turn HTML output into markdown for Discord
const turndownService = new TurndownService({
  headingstyle: 'atx',
  hr: '',
  emDelimiter: '*',
  fence: '',
});

const client = new Discord.Client();
const config = require('./config/config.json');

client.on('ready', () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`,
  );
  // downloadHTML();
  downloadTask.start();
  client.user.setActivity('exposition fairy');
  /* set avatar (only needs to be done once)
  client.user.setAvatar('./images/raven.jpg')
    .then(() => console.log('Avatar set!'))
    .catch(console.error); */
});

client.on('guildCreate', (guild) => {
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`,
  );
  client.user.setActivity('exposition fairy');
});

client.on('guildDelete', (guild) => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity('exposition fairy');
});


client.on('message', async (message) => {
  if (BANNED_CHANNEL_IDS.includes(message.channel.id)) return;
  if (message.author.bot) return;

  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  function listProgress(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: WORDS_SPREADSHEET,
        range: 'A2:I',
      },
      (err, res) => {
        if (err) {
          message.channel.send(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
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
              numbersUp = true;
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
              if (numbersUp) {
                sent.react('758041474335113397');
              }
            });
          }
        } else {
          console.log('No data found.');
          message.channel.send('Error contacting the server.');
        }
        return true;
      },
    );
  }

  function listWog(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: WOG_SPREADSHEET,
        range: 'D9:E105',
        valueRenderOption: 'FORMULA',
      },
      (err, res) => {
        if (err) {
          message.channel.send(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
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
          message.channel.send(wogEmbed);
        }
        return true;
      },
    );
  }

  if (command === 'help') {
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +help.`,
      );
    } else console.log('Someone used command +help.');

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
            'Shows the current progress of the next Worth the Candle batch of chapters. Please use in #bot-ez.',
        },
        { name: '+explain/+e', value: 'Given a story\'s acronym, outputs its full name and link. Full list can be accessed with "all" as an argument.' },
        {
          name: '+podcast',
          value:
            'Adds the role Rationally Writing to the user, in order to be reminded of new AW podcast releases. Use again to remove.',
        },
        { name: '+power', value: 'Outputs a random Alexander Walesque superpower with a drawback.' },
        {
          name: '+testsearch <search term>',
          value:
            '(Direct Message only) Searches the entire text of Worth the Candle. Currently buggy and unreliable.',
        },
      );
    message.channel.send(helpEmbed);
  }

  if (command === 'ping') {
    const m = await message.channel.send('Ping?');
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +ping.`,
      );
    } else console.log('Someone used command +ping.');
    m.edit(
      `Pong! Latency is ${
        m.createdTimestamp - message.createdTimestamp
      }ms. API Latency is ${Math.round(client.ws.ping)}ms`,
    );
  }

  if (command === 'power') {
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +power.`,
      );
    } else console.log('Someone used command +power.');
    const powerEmbed = new Discord.MessageEmbed()
      .setColor('#A4DACC')
      .setAuthor('Alexander Wales', 'https://www.royalroadcdn.com/public/avatars/avatar-119608.png')
      .setDescription(generatePower());
    message.channel.send(powerEmbed);
  }

  if (command === 'powerm') {
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +powerm.`,
      );
    } else console.log('Someone used command +powerm.');
    const powermEmbed = new Discord.MessageEmbed()
      .setColor('#A4DACC')
      .setAuthor('Alexander Wales', 'https://www.royalroadcdn.com/public/avatars/avatar-119608.png')
      .setDescription(generatePowerm());
    message.channel.send(powermEmbed);
  }

  if (
    command === 'progress'
    || command === 'p'
    || command === 'pogress'
    || command === 'pog'
    || command === 'regress'
  ) {
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +${
          command
        } in channel ${
          message.channel.id
        }.`,
      );
    } else {
      console.log(
        `Someone used command +${
          command
        } in channel ${
          message.channel.id
        }.`,
      );
    }
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), listProgress);
      return true;
    });
  }

  if (command === 'digress') {
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +digress.`,
      );
    } else console.log('Someone used command +digress.');
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), listWog);
      return true;
    });
  }

  if (command === 'egress') {
    message.channel.send({
      files: ['./images/egress.jpg'],
    });
  }

  if (command === 'congress') {
    message.channel.send({
      files: ['./images/congress.jpg'],
    });
  }

  if (command === 'cypress') {
    message.channel.send({
      files: ['./images/cypress.png'],
    });
  }

  if (command === 'frogress') {
    message.channel.send({
      files: ['./images/frogress.png'],
    });
  }

  if (command === 'dogress') {
    message.channel.send({
      files: ['./images/dogress.png'],
    });
  }

  if (command === 'transgress') {
    message.channel.send({
      files: ['./images/transgress.jpg'],
    });
  }

  if (command === 'logress') {
    if (message.member) {
      message.channel.send(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +${
          command
        } in channel ${
          message.channel.name
        } (${
          message.channel.id
        }).`,
      );
    } else {
      message.channel.send(
        `You used command +${
          command
        } in a private message or something spooky like that (${
          message.channel.id
        }).`,
      );
    }
  }

  if (command === 'podcast') {
    if (message.member) {
      if (
        !message.member.roles.cache.some(
          (role) => role.name === 'Rationally Writing',
        )
      ) {
        console.log(
          `${message.member.user.tag
          }(${
            message.member.user
          }) used command +podcast without the role`,
        );
        const role = message.guild.roles.cache.find(
          (rol) => rol.name === 'Rationally Writing',
        );
        message.member.roles.add(role);
        message.channel.send(
          'Rationally Writing role added successfully. Listen to the podcast at <http://daystareld.com/podcasts/rationally-writing/>',
        );
      } else {
        const role = message.guild.roles.cache.find(
          (rol) => rol.name === 'Rationally Writing',
        );
        console.log(
          `${message.member.user.tag
          }(${
            message.member.user
          }) used command +podcast with the role`,
        );
        message.member.roles.remove(role);
        message.channel.send('Rationally Writing role removed successfully.');
      }
    } else {
      message.channel.send(
        'You need more Degrees of Reasonableness in order to use this command in a Direct Message.',
      );
    }
  }
  
  if (command === 'explain' || command === 'e') {
    const explained = args.join(' ');
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +explain and asked for '${ explained }'.`,
      );
    } else {
      console.log( `Someone used command +explain and searched '${explained}'.`);
    }
    if (explained.toUpperCase() === 'ALL' || explained === '*' || explained === ''){
      message.channel.send(
        `The full list of works available to this command is located at <https://discord.com/channels/437695037401464851/437697099383963668/848202602688282655>.`,
      );
    }
    else if (explained.toUpperCase() in EXPLANATIONS) {
      const story = EXPLANATIONS[explained.toUpperCase()];
      message.channel.send(
        `I've found something called ***${story.name}***. Is this what you were looking for? ${story.link}`,
      );
    } else {
      message.channel.send(
        `I can't find that story among my 32768 books.`,
      );
    }
  }

  if (command === 'testsearch') {
    const searchContent = args.join(' ');
    if (message.member) {
      console.log(
        `${message.member.user.tag
        }(${
          message.member.user
        }) used command +search and searched '${
          searchContent
        }'.`,
      );
    } else {
      console.log(
        `Someone used command +search and searched '${searchContent}'.`,
      );
      grep(searchContent, 'files/wtc.html', (list) => {
        if (list.length > 0) {
          let searchResults = '';
          let i = 0;
          list.forEach((row) => {
            if (row.length > 0) {
              i += 1;
              let start = 0;
              let end = 150;
              const pattern = new RegExp(searchContent, 'gi');
              const match = row.match(pattern);
              if (row.indexOf(match[0]) > end) {
                start = row.indexOf(match[0]) - 75;
                end = row.indexOf(match[0]) + 75;
              }
              if (end > row.length) end = row.length;
              if (end - start < 150) start = end - 150;
              if (start < 0) start = 0;
              // HACKERMAN AHEAD
              searchResults
                += `**Result ${
                  i
                }:** ...`
                + `${turndownService
                  .turndown(row)
                  .replace('* * *', '')
                  .trim()
                  .slice(start, end)
                  .replace('_', '')
                  .replace(/\n/g, ' ')
                  .split('**')
                  .join('')
                  .replace(pattern, '**$&**')}`
                + '...'
                + '\n';
            }
          });

          if (searchResults.length > 1500) {
            message.channel.send(
              'Error displaying search results (result too big to display).',
            );
            console.log(searchResults);
          } else if (searchResults !== '') message.channel.send(searchResults);
          else message.channel.send('No matches found.');
        } else message.channel.send('No matches found.');
      });
    }
  }
});

client.login(config.token);
