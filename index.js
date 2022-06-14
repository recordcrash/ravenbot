// **RavenBot Main Loop**

const {
  Message,
  TextChannel,
  Client,
  Intents,
  MessageEmbed,
  Webhook,
} = require("discord.js");
const storage = require("node-persist");
const fs = require("fs");
const { google } = require("googleapis");
const {
  BANNED_CHANNEL_IDS,
  WTC_SPREADSHEET,
  WOG_SPREADSHEET,
  TEST_SPREADSHEET,
  DUNGEONS_SPREADSHEET,
} = require("./helpers/constants");
const { authorize } = require("./config/google");
const {
  getProgressFromSheet,
  getWogFromSheet,
  getStatsFromSheet,
} = require("./commands/sheetCommands");
const {
  generatePower,
  generatePowerm,
  generateEntad,
} = require("./commands/powerCommands");
const { getHelpEmbed } = require("./commands/staticCommands");
const { explainCommand } = require("./commands/constantCommands");
const { giveRoleToUser } = require("./commands/roleCommands");
const { initializeCommands } = require("./commands/managementCommands");
const config = require("./config/config.json");
const { getAIResponse } = require("./gpt3/parseCommand");

// Client options with intents for new Discord API v9
const clientOptions = {
  intents: [
    Intents.FLAGS.GUILDS, // Channels joined
    Intents.FLAGS.GUILD_MESSAGES, // Messages in a server
    Intents.FLAGS.DIRECT_MESSAGES, // Direct messages sent to bot
  ],
  partials: [
    "CHANNEL", // Need to enable to see DMs
  ],
};

const WomboDreamApi = require("wombo-dream-api");

// Invite URL
// https://discord.com/oauth2/authorize?client_id=872531052420280372&scope=bot+applications.commands&permissions=260316196049

// Persistent storage for grand total
storage.initSync();

// Initialize discord client
const client = new Client(clientOptions);

// Finally, Ravenbot Begins
client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );
  client.user.setPresence({ activities: [{ name: "exposition fairy" }] });

  /* set avatar (only needs to be done once)
  client.user.setAvatar('./images/raven.jpg')
    .then(() => console.log('Avatar set!'))
    .catch(console.error); */
});

// Slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (BANNED_CHANNEL_IDS.includes(interaction.channel.id)) return;
  console.log(interaction);

  function listProgress(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: DUNGEONS_SPREADSHEET,
        range: "A2:I",
      },
      (err, res) => {
        if (err) {
          interaction.reply(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
        getProgressFromSheet(res, interaction, storage);
        return true;
      }
    );
  }

  function listWog(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: WOG_SPREADSHEET,
        range: "D9:E105",
        valueRenderOption: "FORMULA",
      },
      (err, res) => {
        if (err) {
          interaction.reply(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
        getWogFromSheet(res, interaction);
        return true;
      }
    );
  }

  function printDailyStats(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: DUNGEONS_SPREADSHEET,
        range: "Speed Stats!A1:C90",
        valueRenderOption: "FORMULA",
      },
      (err, res) => {
        if (err) {
          interaction.reply(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
        getStatsFromSheet(res, interaction, "daily");
        return true;
      }
    );
  }

  function printWeeklyStats(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: DUNGEONS_SPREADSHEET,
        range: "Speed Stats!A1:C90",
        valueRenderOption: "FORMULA",
      },
      (err, res) => {
        if (err) {
          interaction.reply(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
        getStatsFromSheet(res, interaction, "weekly");
        return true;
      }
    );
  }

  function printMonthlyStats(auth) {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: DUNGEONS_SPREADSHEET,
        range: "Speed Stats!A1:C90",
        valueRenderOption: "FORMULA",
      },
      (err, res) => {
        if (err) {
          interaction.reply(`Error contacting the Discord API: ${err}`);
          return console.log(`The API returned an error: ${err}`);
        }
        getStatsFromSheet(res, interaction, "monthly");
        return true;
      }
    );
  }

  if (interaction.commandName === "help") {
    interaction.reply({
      embeds: [getHelpEmbed()],
      allowedMentions: { repliedUser: false },
    });
  }

  if (interaction.commandName === "power") {
    const method = interaction.options.getString("method");
    let powerDescription = "Power failed to generate.";
    switch (method) {
      case "bacontime":
        powerDescription = generatePowerm();
        break;
      case "entad":
        powerDescription = generateEntad();
        break;
      default:
        powerDescription = generatePower();
        break;
    }
    const powerEmbed = new MessageEmbed()
      .setColor("#A4DACC")
      .setAuthor(
        "Alexander Wales",
        "https://www.royalroadcdn.com/public/avatars/avatar-119608.png"
      )
      .setDescription(powerDescription);
    const messages = await getAIResponse(
      "Everyman",
      `Can you please generate a random ${
        method == "entad" ? "magical item" : "superpower"
      } that fits the description '${powerDescription}'?`,
      interaction.channelId,
      interaction.member.user.tag.split("#")[0]
    );

    const explainationEmbed = new MessageEmbed()
      .setColor("#A4DACC")
      .setAuthor(messages[0].username, messages[0].avatar_url)
      .setDescription(messages[0].content);

    interaction.reply({
      embeds: [powerEmbed, explainationEmbed],
      allowedMentions: { repliedUser: false },
    });
  }

  if (interaction.commandName === "progress") {
    fs.readFile("./config/credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), listProgress, interaction);
      return true;
    });
  }

  if (interaction.commandName === "digress") {
    fs.readFile("./config/credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), listWog, interaction);
      return true;
    });
  }

  if (interaction.commandName === "stats") {
    const frequency = interaction.options.getString("frequency");
    fs.readFile("./config/credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Sheets API.
      switch (frequency) {
        case "daily":
          authorize(JSON.parse(content), printDailyStats, interaction);
          break;
        case "monthly":
          authorize(JSON.parse(content), printMonthlyStats, interaction);
          break;
        case "weekly":
          authorize(JSON.parse(content), printWeeklyStats, interaction);
          break;
        default:
          authorize(JSON.parse(content), printDailyStats, interaction);
          break;
      }

      return true;
    });
  }

  if (
    interaction.commandName === "explain" ||
    interaction.commandName === "e"
  ) {
    explainCommand(interaction);
  }

  if (interaction.commandName === "getrole") {
    giveRoleToUser(interaction);
  }
});

const doAIStuff = async (message, args) => {
  // const allowedChannels = JSON.parse(
  //   fs.readFileSync("./gpt3/allowedChannels.json")
  // ).channels;
  // if (!allowedChannels.includes(message.channelId)) {
  //   client.channels.fetch(adminChannel).then((channel) => {
  //     channel.send(
  //       `${message.member.user.username} tried to use the hey command in ${message.channel.name} of ${message.guild.name}, use [-authorise ${message.channel.id}] to allow this.`
  //     );
  //     message.reply("Your channel is pending approval...");
  //   });
  // } else {
  var webhook = (await message.channel.fetchWebhooks()).values().next().value;
  if (!webhook) {
    webhook = await message.channel.createWebhook("WebHook");
  }
  const messages = await getAIResponse(
    args[0],
    args.slice(1).join(" "),
    message.channelId,
    message.member.user.tag.split("#")[0]
  );
  messages.map((newmessage) =>
    webhook.send({
      content: newmessage.content,
      avatarURL: newmessage.avatar_url,
      username: newmessage.username,
      embeds: newmessage.embeds,
    })
  );
  // }
};
// Regular commands
client.on("messageCreate", async (message) => {
  if (BANNED_CHANNEL_IDS.includes(message.channel.id)) return;

  if (message.author.bot) return;

  if (message.mentions?.repliedUser?.bot) {
    doAIStuff(message, [
      message.mentions.repliedUser.username,
      message.content,
    ]);
  }

  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (message.member) {
    console.log(
      `${message.member.user.tag}(${message.member.user}) used command +${command} in channel ${message.channel.id}.`
    );
  } else
    console.log(
      `Someone used command +${command} in channel ${message.channel.id}.`
    );

  if (command === "egress") {
    message.reply({
      files: ["./images/egress.jpg"],
      allowedMentions: { repliedUser: false },
    });
  }

  if (command === "congress") {
    message.reply({
      files: ["./images/congress.jpg"],
      allowedMentions: { repliedUser: false },
    });
  }

  if (command === "cypress") {
    message.reply({
      files: ["./images/cypress.jpg"],
      allowedMentions: { repliedUser: false },
    });
  }

  if (command === "frogress") {
    message.reply({
      files: ["./images/frogress.png"],
      allowedMentions: { repliedUser: false },
    });
  }

  if (command === "dogress") {
    message.reply({
      files: ["./images/dogress.png"],
      allowedMentions: { repliedUser: false },
    });
  }

  if (command === "initializecommands") {
    initializeCommands(client);
  }
  
   if (command === "picture") {
    const loadingMessage = await message.reply("I'm working on it...");
    WomboDreamApi.buildDefaultInstance()
      .generatePicture(args.join(" "), 10, (task) => {
        loadingMessage.edit({
          content: null,
          embeds: [
            {
              title: "Generating picture...",
              description: `${task.state}:${task.photo_url_list.length * 5.0}%`,
              image: {
                url: task.photo_url_list[task.photo_url_list.length - 1],
              },
            },
          ],
        });
        console.log(task.state, "stage", task?.photo_url_list?.length);
      })
      .then(async (task) => {
        loadingMessage.edit({
          content: null,
          embeds: [
            {
              title: args.join(" "),
              description: `Completed`,
              image: {
                url: task?.result?.final,
              },
            },
          ],
        });
      })
      .catch((err) => {
        console.log(err);
        loadingMessage.edit("Something went wrong");
      });
  }
  
  console.log(message.channelId);
  const adminChannel = "973891057139974144";

  // if (command === "authorise" && message.channelId === adminChannel) {
  //   const allowedChannels = JSON.parse(
  //     fs.readFileSync("./gpt3/allowedChannels.json")
  //   );
  //   allowedChannels.channels.push(args[0]);
  //   fs.writeFileSync(
  //     "./gpt3/allowedChannels.json",
  //     JSON.stringify(allowedChannels)
  //   );
  //   message.reply("Channel added to allowed channels.");
  //   client.channels.fetch(args[0]).then((channel) => {
  //     channel.send("Hi! You have been approved for Writerbot in this channel!");
  //   });
  // }
  console.log(message);
  if (command === "hey") {
    doAIStuff(message, args);
  }
});

client.on("guildCreate", (guild) => {
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
  );
  client.user.setActivity("exposition fairy");
});

client.on("guildDelete", (guild) => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity("exposition fairy");
});

client.login(config.token);
