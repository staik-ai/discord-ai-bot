const description = 'Stop the bot.'

const run = async (interaction, client) => {
    await interaction.reply({content: 'Shutting down the bot...', ephemeral: true});
    await process.exit(1);
}

const developer = true; // This is a developer command. Only the developer can use it.

module.exports= {run, description, developer};