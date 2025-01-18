/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "<:Info:1330256387959164928> You must provide a valid message id.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "<:Info:1330256387959164928> You need to have the manage messages permissions to start giveaways.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `<:No:1330253494447243355> Unable to find a giveaway for messageId: ${messageId}`;

  // Check if the giveaway is ended
  if (!giveaway.ended) return "<:No:1330253494447243355> The giveaway is not ended yet.";

  try {
    await giveaway.reroll();
    return "<:Yes:1330253737687781436> Giveaway rerolled!";
  } catch (error) {
    member.client.logger.error("Giveaway Reroll", error);
    return `<:No:1330253494447243355> An error occurred while rerolling the giveaway: ${error.message}`;
  }
};
