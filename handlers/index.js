const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");

require("dotenv").config();

async function setReadMode(value) {
  await fs.writeFileSync(
    "config.json",
    JSON.stringify({ readMode: value }, null, 4)
  );
}
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.events = new Collection();

//Event Handler
let eventTmp = [];
let eventFiles = fs.readdirSync(path.join(__dirname, "../events"));

eventFiles.forEach(async (file, i) => {
  eventTmp[i] = await import(`../events/${file}`);
  let eventName = file.split(".")[0];
  client.on(eventName, eventTmp[i].init);
});

client.login(process.env.TOKEN);

module.exports = { client, setReadMode };
