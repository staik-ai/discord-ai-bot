const fs = require("fs");

const description = "Change the bot's voice.";
const options = [
  {
    name: "voice",
    description: "The voice you want to change to.",
    type: 3,
    required: true,
    choices: [
      {
        name: "Emma",
        value: "Emma",
      },
      {
        name: "Brian",
        value: "Brian",
      },
      {
        name: "Amy",
        value: "Amy",
      },

      {
        name: "Justin",
        value: "Justin",
      },
    ],
  },
];

const run = async (interaction, client) => {
  const voice = interaction.options.getString("voice");
  let config = await JSON.parse(
    fs.readFileSync(require.resolve("../../config.json"))
  );
  if (config[interaction.guildId].gpt.voice !== voice) {
    config[interaction.guildId].gpt.voice = voice;
    await fs.writeFileSync(
      require.resolve("../../config.json"),
      JSON.stringify(config, null, 4)
    );
    await interaction.reply(
      `The voice has been successfully changed to ${voice}.`
    );
  } else {
    await interaction.reply(`The voice is already set to ${voice}.`);
  }
};

module.exports = { run, description, options };
