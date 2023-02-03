const { loadCommands } = require("../../events/ready.js");
const description = "Reloads all commands.";

const run = async (message, client) => {
  await message.reply({
    content: "Reloading all commands...",
    ephemeral: true,
  });
  try {
    await loadCommands(client);
  } catch (error) {
    await message.editReply({
      content: `There was a problem while running this message.`,
      ephemeral: true,
    });
    await console.log(error);
  }
  await message.editReply({
    content: `All commands have been reloaded!`,
    ephemeral: true,
  });
};

const developer = true; // Developer command.

module.exports = { run, description, developer };
