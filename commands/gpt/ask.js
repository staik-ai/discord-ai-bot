const {clearPrompt, runGPT} = require("../../handlers/gpt-handler.js");
const {ApplicationCommandOptionType} = require('discord.js');
const fs = require("fs");

const STRING = ApplicationCommandOptionType.String
require('dotenv').config();

const description = 'Speak to an awesome AI'
const options = [
    {
        name: 'message',
        description: 'Your message to the bot',
        required: true,
        type: STRING,
    },

]



const run = async (interaction, client) => {
    let config= JSON.parse(fs.readFileSync(require.resolve('../../config.json')));
    const guildID = interaction.guildId;
    const msg = interaction.options.getString('message');
    await interaction.deferReply();
    try {
        config[guildID].gpt.prompt = '';
        config[guildID].readMode = false;
        await fs.writeFileSync(require.resolve('../../config.json'), JSON.stringify(config, null, 4));
        const completion = await runGPT(guildID,msg);
        await interaction.editReply(completion);
    } catch (error) {
        await interaction.editReply("There was an error while speaking to ChatGPT. Please try again later.");
        await console.log(error);
    }


}

module.exports= {run, description, options}
