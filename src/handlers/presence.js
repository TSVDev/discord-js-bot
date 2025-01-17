const { ActivityType } = require("discord.js");

/**
 * @param {import('@src/structures').BotClient} client
 */
function updatePresence(client) {
  let message = client.config.PRESENCE.MESSAGE;

   // Retrieve the user count for the specific guild with ID '1144357037879341148'
   const labGuildId = '1144357037879341148';
   const labGuild = client.guilds.cache.get(labGuildId);
 
   // Fetch the lab guild's user count
   let labUsers = 0;
   if (labGuild) {
     labUsers = labGuild.memberCount;
   }

  if (message.includes("{servers}")) {
    message = message.replaceAll("{servers}", client.guilds.cache.size);
  }

  if (message.includes("{members}")) {
    const members = client.guilds.cache.map((g) => g.memberCount).reduce((partial_sum, a) => partial_sum + a, 0);
    message = message.replaceAll("{members}", members - 8);
  }

   // Add the lab users count to the message (You can add it in any format you need)
   if (message.includes("{labUsers}")) {
    message = message.replaceAll("{labUsers}", labUsers);

   }

  const getType = (type) => {
    switch (type) {
      case "COMPETING":
        return ActivityType.Competing;

      case "LISTENING":
        return ActivityType.Listening;

      case "PLAYING":
        return ActivityType.Playing;

      case "WATCHING":
        return ActivityType.Watching;
    }
  };

  client.user.setPresence({
    status: client.config.PRESENCE.STATUS,
    activities: [
      {
        name: message,
        type: getType(client.config.PRESENCE.TYPE),
      },
    ],
  });
}

module.exports = function handlePresence(client) {
  updatePresence(client);
  setInterval(() => updatePresence(client), 10 * 60 * 1000);
};
