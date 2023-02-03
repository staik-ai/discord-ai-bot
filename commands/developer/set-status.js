const { ApplicationCommandOptionType, ActivityType } = require("discord.js");
const description = "Sets the bot's status.";
const STRING = ApplicationCommandOptionType.String;

const options = [
  {
    name: "status",
    description: "The status to set.",
    required: true,
    type: STRING,
    choices: [
      {
        name: "Online",
        value: "online",
      },
      {
        name: "Idle",
        value: "idle",
      },
      {
        name: "Do Not Disturb",
        value: "dnd",
      },
      {
        name: "Invisible",
        value: "invisible",
      },
    ],
  },
  {
    name: "activity",
    description: "The activity to set.",
    required: false,
    type: STRING,
    choices: [
      {
        name: "Playing",
        value: "playing",
      },
      {
        name: "Streaming",
        value: "streaming",
      },
      {
        name: "Listening to",
        value: "listening",
      },
      {
        name: "Watching",
        value: "watching",
      },
    ],
  },
  {
    name: "name",
    description: "The name of the activity.",
    required: false,
    type: STRING,
  },
  {
    name: "url",
    description: "The url of the activity.",
    required: false,
    type: STRING,
  },
];

const run = async (message, client) => {
  const status = message.options.getString("status");
  const activity = message.options.getString("activity");
  const name = message.options.getString("name") || "";
  const url = message.options.getString("url");
  const activities = {
    playing: ActivityType.Playing,
    streaming: ActivityType.Streaming,
    listening: ActivityType.Listening,
    watching: ActivityType.Watching,
  };
  const activityType = activities[activity]; // This is the activity type.

  await client.user.setPresence({
    activities: [
      {
        name: name,
        type: activityType,
        url: url,
      },
    ],
    status: status,
  });

  message.reply({ content: "Status set.", ephemeral: true });
};

const developer = true; // This is a developer command. Only the developer can use it.

module.exports = { run, description, developer, options };
