const { client } = require("../handlers/index.js");
require("dotenv").config();

const init = async (interaction) => {
  //Command Listener
  if (interaction.isCommand()) {
    const { commandName } = interaction;
    const selectedCommand = client.commands.get(commandName);
    if (
      selectedCommand.developer &&
      interaction.user.id !== process.env.DEVELOPER_ID
    ) {
      return interaction.reply({
        content: "This command is only available to the developer.",
        ephemeral: true,
      });
    } else {
      try {
        await selectedCommand.run(interaction, client);
      } catch (error) {
        interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
        console.error(`Error executing ${commandName}`);
        console.error(error);
      }
    }
  }

  //Button Listener
  else if (interaction.isButton()) {
    if (interaction.customId === "primary") {
      await interaction.update({
        content: "A primary button was clicked!",
        components: [],
      });
    } else {
      await interaction.update({
        content: "Another button was clicked!",
        components: [],
      });
    }
  }
  //Modal Listener
  else if (interaction.isModalSubmit()) {
    if (interaction.customId === "myModal") {
      await interaction.reply({
        content: "Your submission was received successfully!",
      });
    }
  }
  //Context Menu
  else if (interaction.isUserContextMenuCommand()) {
    console.log(interaction);
  }
};

module.exports = { init };
