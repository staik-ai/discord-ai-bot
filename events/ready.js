const { promisify } = require("util");
const glob = require("glob");
const fs = require("fs");
const globPromise = promisify(glob);
const { AutoPoster } = require("topgg-autoposter");

require("dotenv").config();

const loadCommands = async (client) => {
  await client.commands.clear();
  const commandFiles = await globPromise(`${process.cwd()}/commands/*/**.js`);
  await Promise.all(
    commandFiles.map(async (value) => {
      delete require.cache[require.resolve(value)];
      const file = require(value);
      const splitted = value.split("/");
      const directory = splitted[splitted.length - 1];
      const name = directory.split(".")[0];
      if (file.run) {
        const properties = { name, directory, ...file };
        await client.commands.set(name, properties);
      }
    })
  );

  console.log(
    `Started refreshing ${client.commands.size} application (/) commands.`
  );
  await client.application.commands
    .set(client.commands)
    .then(() => {
      console.log(
        "\x1b[32m%s\x1b[0m",
        `Successfully reloaded ${client.commands.size} application (/) commands.`
      );
    })
    .catch(console.error);
};

const init = async (client) => {
  console.log(
    "\x1b[35m%s\x1b[0m",
    `Ready! Logged in as ${client.user.username}.`
  );
  await client.user.setPresence({
    status: "idle",
  });
  const Guilds = client.guilds.cache.map((guild) => guild.id);
  let config = JSON.parse(fs.readFileSync(require.resolve("../config.json")));
  for (let i = 0; i < Guilds.length; i++) {
    config[Guilds[i]] = {
      readMode: false,
      gpt: {
        voice: "Emma",
        prompt: "",
        userID: null,
        channelID: null,
      },
    };
  }
  await fs.writeFileSync("config.json", JSON.stringify(config, null, 4));

  await loadCommands(client);
  await client.user.setPresence({
    activities: [
      {
        name: "your commands",
        type: 2,
      },
    ],
    status: "online",
  });
};

module.exports = { init, loadCommands };
