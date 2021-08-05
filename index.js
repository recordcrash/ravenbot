// **RavenBot Main Loop**

const Discord = require('discord.js');
const storage = require('node-persist');
const fs = require('fs');
const { google } = require('googleapis');
const {
  BANNED_CHANNEL_IDS, WTC_SPREADSHEET, WOG_SPREADSHEET, EXPLANATIONS,
  TEST_SPREADSHEET, DUNGEONS_SPREADSHEET,
} = require('./config/constants');
const { authorize } = require('./config/google');
const { getProgressFromSheet } = require('./commands/sheetCommands');
const { generatePower, generatePowerm } = require('./commands/powerCommands');
const { getHelpEmbed } = require('./commands/staticCommands');

// Persistent storage for grand total
storage.initSync();

const client = new Discord.Client();
const config = require('./config/config.json');

client.on('ready', () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`,
  );
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

  if (message.member) {
    console.log(`${message.member.user.tag}(${message.member.user}) used command +${command} in channel ${message.channel.id}.`);
  } else {
    console.log(`Someone used command +${command} in channel ${message.channel.id}.`);
  }

  function listProgress(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: TEST_SPREADSHEET,
        range: 'A2:I',
      },
      (err, res) => {
        if (err) {
          message.channel.send(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
        getProgressFromSheet(res, message, storage, command);
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
    message.channel.send(getHelpEmbed());
  }

  if (command === 'ping') {
    const m = await message.channel.send('Ping?');
    m.edit(
      `Pong! Latency is ${
        m.createdTimestamp - message.createdTimestamp
      }ms. API Latency is ${Math.round(client.ws.ping)}ms`,
    );
  }

  if (command === 'power') {
    const powerEmbed = new Discord.MessageEmbed()
      .setColor('#A4DACC')
      .setAuthor('Alexander Wales', 'https://www.royalroadcdn.com/public/avatars/avatar-119608.png')
      .setDescription(generatePower());
    message.channel.send(powerEmbed);
  }

  if (command === 'powerm') {
    const powermEmbed = new Discord.MessageEmbed()
      .setColor('#A4DACC')
      .setAuthor('Alexamder Walesm', 'https://www.royalroadcdn.com/public/avatars/avatar-119608.png')
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
    fs.readFile('./config/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), listProgress);
      return true;
    });
  }

  if (command === 'digress') {
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

  if (
    command === 'podcast'
    || command === 'flower'
  ) {
    let rolename = 'Role name';
    let addmsg = `\`${rolename}\` role added successfully.`;
    if (command === 'podcast') {
      rolename = 'Rationally Writing';
      addmsg = `\`${rolename}\` role added successfully. Listen to the podcast at <http://daystareld.com/podcasts/rationally-writing/>`;
    }
    if (command === 'flower') {
      rolename = 'Flower';
      addmsg = `\`${rolename}\` role added successfully. Read the story at <https://www.royalroad.com/fiction/28806> and discuss it in #flower.`;
    }

    if (message.member) {
      if (
        !message.member.roles.cache.some(
          (role) => role.name === rolename,
        )
      ) {
        const role = message.guild.roles.cache.find(
          (rol) => rol.name === rolename,
        );
        message.member.roles.add(role);
        message.channel.send(addmsg);
      } else {
        const role = message.guild.roles.cache.find(
          (rol) => rol.name === rolename,
        );
        message.member.roles.remove(role);
        message.channel.send(`\`${rolename}\` role removed successfully.`);
      }
    } else {
      message.channel.send(
        'You need more Degrees of Reasonableness in order to use this command in a Direct Message.',
      );
    }
  }

  if (command === 'explain' || command === 'e') {
    const explained = args.join(' ');
    if (explained.toUpperCase() === 'ALL' || explained === '*' || explained === '') {
      message.channel.send(
        'The full list of works available to this command is located at <https://discord.com/channels/437695037401464851/437697099383963668/848202602688282655>.',
      );
    } else if (explained.toUpperCase() in EXPLANATIONS) {
      const story = EXPLANATIONS[explained.toUpperCase()];
      message.channel.send(
        `I've found something called ***${story.name}***. Is this what you were looking for? ${story.link}`,
      );
    } else {
      message.channel.send(
        'I can\'t find that story among my 32768 books.',
      );
    }
  }
});

client.login(config.token);
