const { ApplicationCommandOptionType, Permissions, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "lock",
  description: "Locks a channel",
  category: "MODERATION",
  userPermissions: ["ManageChannels"],
  modLogChannelId: "1166895341518454845", // Replace with your mod log channel ID
  command: {
    enabled: true,
    aliases: ["l"],
    usage: "<channel> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "Channel to lock",
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
      {
        name: "reason",
        description: "Reason for locking (optional)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const channel = message.mentions.channels.first();
    const reason = args[1] || "No reason provided";

    if (!channel) return message.channel.send("Please specify a channel to lock");

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
      'SendMessages': false,
    });

    const embed = new EmbedBuilder()
      .setTitle("**CHANNEL LOCKED**")
      .setDescription(`The channel ${channel} has been locked.\nReason: ${reason}\nLocked by: ${message.author}`)
      .setColor("#ff0000");

    // Send log to mod log channel
    const modLogChannel = message.guild.channels.cache.get(this.modLogChannelId);
    if (modLogChannel) {
      modLogChannel.send({ embeds: [embed] });
    }

    channel.send({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const channel = interaction.options.getChannel("channel");
    const reason = interaction.options.getString("reason") || "No reason provided";

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      'SendMessages': false,
    });

    const embed = new EmbedBuilder()
      .setTitle("**CHANNEL LOCKED**")
      .setDescription(`The channel ${channel} has been locked.\nReason: ${reason}\nLocked by: ${interaction.user}`)
      .setColor("#ff0000");

    // Send log to mod log channel
    const modLogChannel = interaction.guild.channels.cache.get(this.modLogChannelId);
    if (modLogChannel) {
      modLogChannel.send({ embeds: [embed] });
    }

    interaction.followUp({ embeds: [embed], ephemeral: true });
  },
}