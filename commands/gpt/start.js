const {ChannelType, ApplicationCommandOptionType} = require('discord.js');
const {
    AudioPlayer,
    VoiceConnectionStatus,
    joinVoiceChannel,
    entersState,
    createAudioResource,
    StreamType, getVoiceConnection, AudioPlayerStatus
} = require("@discordjs/voice");
const Transcriber = require("../../handlers/transcriber");
const {runGPT} = require("../../handlers/gpt-handler");
const fs = require("fs");

const STRING = ApplicationCommandOptionType.String
require('dotenv').config();


const description = 'Start the AI chat';

const options = [
    {
        name: 'type',
        description: 'The type of chat to start.',
        required: true,
        type: STRING,
        choices: [
            {
                name: 'Text',
                value: 'text',
            },
            {
                name: 'Voice',
                value: 'voice',
            },
        ],
    }
]
//Voice Chat
const transcriber = new Transcriber(process.env.WITAI_API_KEY);

async function setCredentials(config, guildID, userID, channelID) {
    config[guildID].readMode = true;
    config[guildID].gpt.userID = userID;
    config[guildID].gpt.channelID = channelID;
    await fs.writeFileSync(require.resolve('../../config.json'), JSON.stringify(config, null, 4));
}

const run = async (interaction, client) => {
    let config = JSON.parse(fs.readFileSync(require.resolve('../../config.json')));

    let userID, channelID, guildID = interaction.guildId;
    const type = interaction.options.getString('type');
    await interaction.deferReply();

    const category = client.channels.cache.find(
        channel => channel.type === ChannelType.GuildCategory
            && channel.guildId === interaction.guild.id
            && channel.name === 'chats');
    if (!category) {
        await interaction.guild.channels.create({
            name: 'ai-chats',
            type: ChannelType.GuildCategory
        })
    }
    if (type === 'text') {
        userID = interaction.member.id;
        if (config[guildID].readMode) {
            await interaction.editReply("AI Chat already running in <#" + config[guildID].gpt.channelID + ">")
        } else {
            await interaction.guild.channels.create({
                name: 'ai-chat',
                type: ChannelType.GuildText,
                parent: category.id
            })
                .then(async channel => {
                    channelID = channel.id;
                    await console.log(`Created new channel: ${channel}`)
                    await channel.send(`Hello and welcome to your chat <@${interaction.member.id}>. Please feel free to ask me any question.`);
                })
                .catch(console.error);
            await setCredentials(config, interaction.guildId, userID, channelID);
            await interaction.editReply("AI Chat channel successfully created.");
        }
    }

    //Voice Chat
    else if (type === 'voice') {
        let audioPlayer = new AudioPlayer();
        let stopWords=["leave","stop","exit","quit","bye","goodbye","ciao"];
        let response;
        let voiceConnection = getVoiceConnection(interaction.guildId);
        let channel = client.channels.cache.find((channel) =>
            channel.guildId === interaction.guild.id
            && channel.type === ChannelType.GuildVoice
            && channel.members.has(interaction.member.id));
        if (!channel) {
            return interaction.editReply("You must be in a voice channel to start a voice chat.");
        }

        if (!voiceConnection || voiceConnection?.state.status === VoiceConnectionStatus.Disconnected) {
            voiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            voiceConnection = await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
            await interaction.editReply("Successfully started listening.");
        } else {
            await interaction.editReply("AI Chat already running");
        }
        voiceConnection.receiver.speaking.on("start", (userId) => {
            if (audioPlayer.state.status === AudioPlayerStatus.Playing) return;
            transcriber.listen(voiceConnection.receiver, userId, client.users.cache.get(userId)).then(async (data) => {
                if (!data.transcript.text) return;
                let text = data.transcript.text;
                let user = client.users.cache.get(userId);
                interaction.channel.send(`${user.username}: `+text);
                if (stopWords.some(word => text.toLowerCase().includes(word))) {
                    config[guildID].gpt.prompt = "";
                    await voiceConnection.destroy();
                    await interaction.channel.send("Successfully stopped listening.");
                    await fs.writeFileSync(require.resolve('../../config.json'), JSON.stringify(config, null, 4));
                    return;
                }
                try {
                    response = await runGPT(guildID, text);
                } catch (error) {
                    await interaction.editReply("There was an error while speaking to ChatGPT. Please try again later.");
                    await console.log(error);
                }
                let url;
                if (response.length > 600) {
                    url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(config[guildID].gpt.voice)}&text=${encodeURIComponent("I am sorry, the response is larger than 600 characters.")}`;
                } else {
                    url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(config[guildID].gpt.voice)}&text=${encodeURIComponent(response)}`;
                }
                const audioResource = await createAudioResource(url, {
                    inputType: StreamType.Arbitrary,
                    inlineVolume: true
                });

                if (voiceConnection.state.status !== VoiceConnectionStatus.Disconnected && voiceConnection.joinConfig.guildId === interaction.guildId) {
                    await voiceConnection.subscribe(audioPlayer);
                    await audioPlayer.play(audioResource);
                }
            });
        });
    }
}

module.exports = {run, description, options}