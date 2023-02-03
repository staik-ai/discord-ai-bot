const { client } = require("../handlers/index.js");
const { runGPT } = require("../handlers/gpt-handler.js");
const fs = require("fs");

const init = async (message) => {
  const guildID = message.guildId;
  let config = await JSON.parse(
    fs.readFileSync(require.resolve("../config.json"))
  )[guildID];
  //console.log(config);
  if (
    !config.readMode ||
    message.member.id !== config.gpt.userID ||
    message.channel.id !== config.gpt.channelID ||
    message.member.id === client.application.id
  )
    return;
  try {
    const completion = await runGPT(guildID, message.content);
    await message.reply(completion);
  } catch (error) {
    await message.reply(
      "There was an error while speaking to ChatGPT. Please try again later."
    );
    await console.log(error);
  }
};

module.exports = { init };
