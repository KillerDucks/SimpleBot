const SimpleBot = require('../index');
const DiscordCreds = require("../Configs/discord_credentials");

const Bot = new SimpleBot(DiscordCreds.Token);

Bot.AddCommand("Version", async (message) => { message.reply("v1.0.0"); });

Bot.Login();