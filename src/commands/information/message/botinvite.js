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
      return message.safeReply("Check your DM for my information! <:Letter:1330257651904282634>");
    } catch (ex) {
      return message.safeReply("<:Info:1330256387959164928> I cannot send you my information! Is your DM open?");
    }
  },
};
