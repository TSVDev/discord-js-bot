/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "<:info:1249145380973838478> You must provide a valid message id.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "<:info:1249145380973838478> You need to have the manage messages permissions to manage giveaways.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `<:no:1235502897215836160> Unable to find a giveaway for messageId: ${messageId}`;

  // Check if the giveaway is paused
  if (giveaway.pauseOptions.isPaused) return "This giveaway is already paused.";

  try {
    await giveaway.pause();
    return "<:yes:1235503385323769877> Success! Giveaway paused!";
  } catch (error) {
    member.client.logger.error("Giveaway Pause", error);
    return `<:no:1235502897215836160> An error occurred while pausing the giveaway: ${error.message}`;
  }
};
