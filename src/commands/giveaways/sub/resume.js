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

  // Check if the giveaway is unpaused
  if (!giveaway.pauseOptions.isPaused) return "<:no:1235502897215836160> This giveaway is not paused.";

  try {
    await giveaway.unpause();
    return "<:yes:1235503385323769877> Success! Giveaway unpaused!";
  } catch (error) {
    member.client.logger.error("Giveaway Resume", error);
    return `<:no:1235502897215836160> An error occurred while unpausing the giveaway: ${error.message}`;
  }
};
