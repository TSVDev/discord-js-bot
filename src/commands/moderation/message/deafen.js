const deafen = require("../shared/deafen");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "deafen",
  description: "deafen specified member in voice channels",
  category: "MODERATION",
  userPermissions: ["DeafenMembers"],
  botPermissions: ["DeafenMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await deafen(message, target, reason);
    await message.safeReply(response);
  },
};
