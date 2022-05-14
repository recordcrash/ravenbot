"use strict";
// **RavenBot Main Loop**
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var _a = require("discord.js"), Client = _a.Client, Intents = _a.Intents, MessageEmbed = _a.MessageEmbed;
var storage = require("node-persist");
var fs = require("fs");
var google = require("googleapis").google;
var _b = require("./helpers/constants"), BANNED_CHANNEL_IDS = _b.BANNED_CHANNEL_IDS, WTC_SPREADSHEET = _b.WTC_SPREADSHEET, WOG_SPREADSHEET = _b.WOG_SPREADSHEET, TEST_SPREADSHEET = _b.TEST_SPREADSHEET, DUNGEONS_SPREADSHEET = _b.DUNGEONS_SPREADSHEET;
var authorize = require("./config/google").authorize;
var _c = require("./commands/sheetCommands"), getProgressFromSheet = _c.getProgressFromSheet, getWogFromSheet = _c.getWogFromSheet, getStatsFromSheet = _c.getStatsFromSheet;
var _d = require("./commands/powerCommands"), generatePower = _d.generatePower, generatePowerm = _d.generatePowerm, generateEntad = _d.generateEntad;
var getHelpEmbed = require("./commands/staticCommands").getHelpEmbed;
var explainCommand = require("./commands/constantCommands").explainCommand;
var giveRoleToUser = require("./commands/roleCommands").giveRoleToUser;
var initializeCommands = require("./commands/managementCommands").initializeCommands;
var config = require("./config/config.json");
var getAIResponse = require("./gpt3/parseCommand").getAIResponse;
// Client options with intents for new Discord API v9
var clientOptions = {
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES, // Direct messages sent to bot
    ],
    partials: [
        "CHANNEL", // Need to enable to see DMs
    ]
};
// Invite URL
// https://discord.com/oauth2/authorize?client_id=872531052420280372&scope=bot+applications.commands&permissions=260316196049
// Persistent storage for grand total
storage.initSync();
// Initialize discord client
var client = new Client(clientOptions);
// Finally, Ravenbot Begins
client.on("ready", function () {
    console.log("Bot has started, with " + client.users.cache.size + " users, in " + client.channels.cache.size + " channels of " + client.guilds.cache.size + " guilds.");
    client.user.setPresence({ activities: [{ name: "exposition fairy" }] });
    /* set avatar (only needs to be done once)
    client.user.setAvatar('./images/raven.jpg')
      .then(() => console.log('Avatar set!'))
      .catch(console.error); */
});
// Slash commands
client.on("interactionCreate", function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    function listProgress(auth) {
        var sheets = google.sheets({ version: "v4", auth: auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: DUNGEONS_SPREADSHEET,
            range: "A2:I"
        }, function (err, res) {
            if (err) {
                interaction.reply("Error contacting the Discord API: " + err);
                return console.log("The API returned an error: " + err);
            }
            getProgressFromSheet(res, interaction, storage);
            return true;
        });
    }
    function listWog(auth) {
        var sheets = google.sheets({ version: "v4", auth: auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: WOG_SPREADSHEET,
            range: "D9:E105",
            valueRenderOption: "FORMULA"
        }, function (err, res) {
            if (err) {
                interaction.reply("Error contacting the Discord API: " + err);
                return console.log("The API returned an error: " + err);
            }
            getWogFromSheet(res, interaction);
            return true;
        });
    }
    function printDailyStats(auth) {
        var sheets = google.sheets({ version: "v4", auth: auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: DUNGEONS_SPREADSHEET,
            range: "Speed Stats!A1:C90",
            valueRenderOption: "FORMULA"
        }, function (err, res) {
            if (err) {
                interaction.reply("Error contacting the Discord API: " + err);
                return console.log("The API returned an error: " + err);
            }
            getStatsFromSheet(res, interaction, "daily");
            return true;
        });
    }
    function printWeeklyStats(auth) {
        var sheets = google.sheets({ version: "v4", auth: auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: DUNGEONS_SPREADSHEET,
            range: "Speed Stats!A1:C90",
            valueRenderOption: "FORMULA"
        }, function (err, res) {
            if (err) {
                interaction.reply("Error contacting the Discord API: " + err);
                return console.log("The API returned an error: " + err);
            }
            getStatsFromSheet(res, interaction, "weekly");
            return true;
        });
    }
    function printMonthlyStats(auth) {
        var sheets = google.sheets({ version: "v4", auth: auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: DUNGEONS_SPREADSHEET,
            range: "Speed Stats!A1:C90",
            valueRenderOption: "FORMULA"
        }, function (err, res) {
            if (err) {
                interaction.reply("Error contacting the Discord API: " + err);
                return console.log("The API returned an error: " + err);
            }
            getStatsFromSheet(res, interaction, "monthly");
            return true;
        });
    }
    var method, powerDescription, powerEmbed, frequency_1;
    return __generator(this, function (_a) {
        if (!interaction.isCommand())
            return [2 /*return*/];
        if (BANNED_CHANNEL_IDS.includes(interaction.channel.id))
            return [2 /*return*/];
        console.log(interaction);
        if (interaction.commandName === "help") {
            interaction.reply({
                embeds: [getHelpEmbed()],
                allowedMentions: { repliedUser: false }
            });
        }
        if (interaction.commandName === "power") {
            method = interaction.options.getString("method");
            powerDescription = "Power failed to generate.";
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
            powerEmbed = new MessageEmbed()
                .setColor("#A4DACC")
                .setAuthor("Alexander Wales", "https://www.royalroadcdn.com/public/avatars/avatar-119608.png")
                .setDescription(powerDescription);
            interaction.reply({
                embeds: [powerEmbed],
                allowedMentions: { repliedUser: false }
            });
        }
        if (interaction.commandName === "progress") {
            fs.readFile("./config/credentials.json", function (err, content) {
                if (err)
                    return console.log("Error loading client secret file:", err);
                // Authorize a client with credentials, then call the Google Sheets API.
                authorize(JSON.parse(content), listProgress, interaction);
                return true;
            });
        }
        if (interaction.commandName === "digress") {
            fs.readFile("./config/credentials.json", function (err, content) {
                if (err)
                    return console.log("Error loading client secret file:", err);
                // Authorize a client with credentials, then call the Google Sheets API.
                authorize(JSON.parse(content), listWog, interaction);
                return true;
            });
        }
        if (interaction.commandName === "stats") {
            frequency_1 = interaction.options.getString("frequency");
            fs.readFile("./config/credentials.json", function (err, content) {
                if (err)
                    return console.log("Error loading client secret file:", err);
                // Authorize a client with credentials, then call the Google Sheets API.
                switch (frequency_1) {
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
        if (interaction.commandName === "explain" ||
            interaction.commandName === "e") {
            explainCommand(interaction);
        }
        if (interaction.commandName === "getrole") {
            giveRoleToUser(interaction);
        }
        return [2 /*return*/];
    });
}); });
// Regular commands
client.on("messageCreate", function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var args, command, webhook, messages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (BANNED_CHANNEL_IDS.includes(message.channel.id))
                    return [2 /*return*/];
                if (message.author.bot)
                    return [2 /*return*/];
                if (message.content.indexOf(config.prefix) !== 0)
                    return [2 /*return*/];
                args = message.content.slice(config.prefix.length).trim().split(/ +/g);
                command = args.shift().toLowerCase();
                if (message.member) {
                    console.log(message.member.user.tag + "(" + message.member.user + ") used command +" + command + " in channel " + message.channel.id + ".");
                }
                else
                    console.log("Someone used command +" + command + " in channel " + message.channel.id + ".");
                if (command === "egress") {
                    message.reply({
                        files: ["./images/egress.jpg"],
                        allowedMentions: { repliedUser: false }
                    });
                }
                if (command === "congress") {
                    message.reply({
                        files: ["./images/congress.jpg"],
                        allowedMentions: { repliedUser: false }
                    });
                }
                if (command === "cypress") {
                    message.reply({
                        files: ["./images/cypress.jpg"],
                        allowedMentions: { repliedUser: false }
                    });
                }
                if (command === "frogress") {
                    message.reply({
                        files: ["./images/frogress.png"],
                        allowedMentions: { repliedUser: false }
                    });
                }
                if (command === "dogress") {
                    message.reply({
                        files: ["./images/dogress.png"],
                        allowedMentions: { repliedUser: false }
                    });
                }
                if (command === "initializecommands") {
                    initializeCommands(client);
                }
                if (!(command === "hey")) return [3 /*break*/, 5];
                return [4 /*yield*/, message.channel.fetchWebhooks()];
            case 1:
                webhook = (_a.sent())
                    .values[0];
                if (!!webhook) return [3 /*break*/, 3];
                return [4 /*yield*/, message.channel.createWebhook("WebHook")];
            case 2:
                webhook = _a.sent();
                _a.label = 3;
            case 3: return [4 /*yield*/, getAIResponse(args[0], args.slice(1).join(" "), message.channelId, message.member.user.tag.split("#")[0])];
            case 4:
                messages = _a.sent();
                messages.map(function (newmessage) {
                    return webhook.send({
                        content: newmessage.content,
                        avatarURL: newmessage.avatar_url,
                        username: newmessage.username,
                        embeds: newmessage.embeds
                    });
                });
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
client.on("guildCreate", function (guild) {
    console.log("New guild joined: " + guild.name + " (id: " + guild.id + "). This guild has " + guild.memberCount + " members!");
    client.user.setActivity("exposition fairy");
});
client.on("guildDelete", function (guild) {
    console.log("I have been removed from: " + guild.name + " (id: " + guild.id + ")");
    client.user.setActivity("exposition fairy");
});
client.login(config.token);
