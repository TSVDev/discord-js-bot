/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "<:Info:1330256387959164928> You must provide a valid message id.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "<:Info:1330256387959164928> You need to have the manage messages permissions to manage giveaways.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `<:No:1330253494447243355> Unable to find a giveaway for messageId: ${messageId}`;

  // Check if the giveaway is unpaused
  if (!giveaway.pauseOptions.isPaused) return "<:No:1330253494447243355> This giveaway is not paused.";

  try {
    await giveaway.unpause();
    return "<:Yes:1330253737687781436> Success! Giveaway unpaused!";
  } catch (error) {
    member.client.logger.error("Giveaway Resume", error);
    return `<:No:1330253494447243355> An error occurred while unpausing the giveaway: ${error.message}`;
  }
};
