/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "troll",
  description: "We do a litte trolling",
  category: "FUN",
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [],
  },

  async messageRun(message, args) {
    await message.safeReply(`Haha get Rick Rolled\nhttps://tenor.com/view/spoiler-gif-24641133`);
  },

  async interactionRun(interaction) {
    await interaction.followUp(`Haha get Rick Rolled!\nhttps://tenor.com/view/spoiler-gif-24641133`);
  },
};
