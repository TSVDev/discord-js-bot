/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "<:info:1249145380973838478> You must provide a valid message id.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "<:info:1249145380973838478> You need to have the manage messages permissions to start giveaways.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `<:no:1235502897215836160> Unable to find a giveaway for messageId: ${messageId}`;

  // Check if the giveaway is ended
  if (!giveaway.ended) return "<:no:1235502897215836160> The giveaway is not ended yet.";

  try {
    await giveaway.reroll();
    return "<:yes:1235503385323769877> Giveaway rerolled!";
  } catch (error) {
    member.client.logger.error("Giveaway Reroll", error);
    return `<:no:1235502897215836160> An error occurred while rerolling the giveaway: ${error.message}`;
  }
};
