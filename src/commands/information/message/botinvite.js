const botinvite = require("../shared/botinvite");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botinvite",
  description: "gives you bot invite",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: false,
  },

  async messageRun(message, args) {
    const response = botinvite(message.client);
    try {
      await message.author.send(response);
      return message.safeReply("Check your DM for my information! :envelope_with_arrow:");
    } catch (ex) {
      return message.safeReply("I cannot send you my information! Is your DM open?");
    }
  },
};
