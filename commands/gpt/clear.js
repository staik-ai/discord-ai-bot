const { clearPrompt } = require("../../handlers/gpt-handler.js");
const fs = require("fs");

const description = "Clear the AI Buffer.";
const options = [];

const run = async (interaction, client) => {
  let config = await JSON.parse(
    fs.readFileSync(require.resolve("../../config.json"))
  );
  config[interaction.guildId].gpt.prompt = "";
  await fs.writeFileSync(
    require.resolve("../../config.json"),
    JSON.stringify(config, null, 4)
  );
  await interaction.reply("The buffer has been successfully cleared.");
};

module.exports = { run, description };
