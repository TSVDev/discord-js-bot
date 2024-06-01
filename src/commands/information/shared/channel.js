const { EmbedBuilder, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { stripIndent } = require("common-tags");
const channelTypes = require("@helpers/channelTypes");

/**
 * @param {import('discord.js').GuildChannel} channel
 */
module.exports = (channel) => {
  const { id, name, parent, position, type } = channel;

  let desc = stripIndent`
      ❯ ID: **${id}**
      ❯ Name: **${name}**
      ❯ Type: **${channelTypes(channel.type)}**
      ❯ Category: **${parent || "NA"}**\n
      `;

  if (type === ChannelType.GuildText) {
    const { rateLimitPerUser, nsfw } = channel;
    desc += stripIndent`
      \n
      ❯ Topic: **${channel.topic || "No topic set"}**
      ❯ Position: **${position}**
      ❯ Slowmode: **${rateLimitPerUser}**
      ❯ isNSFW: **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildPublicThread || type === ChannelType.GuildPrivateThread) {
    const { ownerId, archived, locked } = channel;
    desc += stripIndent`
      \n
      ❯ Owner Id: **${ownerId}**
      ❯ Is Archived: **${archived ? "✓" : "✕"}**
      ❯ Is Locked: **${locked ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildNews || type === ChannelType.GuildNewsThread) {
    const { nsfw } = channel;
    desc += stripIndent`
      \n
      ❯ isNSFW: **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice) {
    const { bitrate, userLimit, full } = channel;
    desc += stripIndent`
      \n
      ❯ Position: **${position}**
      ❯ Bitrate: **${bitrate}**
      ❯ User Limit: **${userLimit}**
      ❯ isFull: **${full ? "✓" : "✕"}**\n
      `;
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Channel Details" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc);

  return { embeds: [embed] };
};
