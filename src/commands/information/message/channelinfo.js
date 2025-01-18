const channelInfo = require("../shared/channel");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "channelinfo",
  description: "shows information about a channel",
  category: "INFORMATION",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[#channel|id]",
    aliases: ["chinfo","ci"],
  },

  async messageRun(message, args) {
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    }

    // find channel by name/ID
    else if (args.length > 0) {
      const search = args.join(" ");
      const tcByName = message.guild.findMatchingChannels(search);
      if (tcByName.length === 0) return message.safeReply(`<:No:1330253494447243355> No channels found matching \`${search}\`! Make sure you input a valid channel ID or mention.`);
      if (tcByName.length > 1) return message.safeReply(`<:No:1330253494447243355> Multiple channels found matching \`${search}\`!`);
      [targetChannel] = tcByName;
    } else {
      targetChannel = message.channel;
    }

    const response = channelInfo(targetChannel);
    await message.safeReply(response);
  },
};
