const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = (member) => {
  let color = member.displayHexColor;
  if (color === "#000000") color = EMBED_COLORS.BOT_EMBED;

  let rolesMentions = member.roles.cache.map((r) => r.toString()).join(", ");
  if (rolesMentions.length > 1024) rolesMentions = rolesMentions.substring(0, 1020) + "...";

  let topRole = member.roles.highest;
  let isBooster = member.premiumSince !== null ? "✔" : "✖";
  let isHuman = member.user.bot ? "✖" : "✔";
  let isServerOwner = member.guild.ownerId === member.id ? "✔" : "✖";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${member.displayName} Information`,
      iconURL: member.user.displayAvatarURL(),
    })
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .addFields(
      {
        name: "Username",
        value: member.user.username,
        inline: true,
      },
      {
        name: "ID",
        value: member.id,
        inline: true,
      },
      {
        name: "Guild Joined",
        value: member.joinedAt.toUTCString(),
      },
      {
        name: "Discord Registered",
        value: member.user.createdAt.toUTCString(),
      },
      {
        name: "Human",
        value: isHuman,
        inline: true,
      },
      {
        name: "Top Role",
        value: topRole.toString(),
        inline: true,
      },
      {
        name: "Booster",
        value: isBooster,
        inline: true,
      },
      {
        name: "Server Owner",
        value: isServerOwner,
        inline: true,
      },
      {
        name: `Roles [${member.roles.cache.size}]`,
        value: rolesMentions,
      },
      {
        name: "Avatar-URL",
        value: `[Download link](${member.user.displayAvatarURL({ format: "png", size: 2048 })})`,
      }
    )
    .setFooter({ text: `Requested by ${member.user.tag}` })
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
