const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: 'Unlocks a channel',
  category: 'MODERATION',
  userPermissions: ['ManageChannels'],
  modLogChannelId: '1166895341518454845', // Replace with your mod log channel ID
  command: {
    enabled: true,
    aliases: ["ul"],
    usage: '<channel>',
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: 'channel',
        description: 'Channel to unlock',
        type: ApplicationCommandOptionType.Channel,
        required: true,
      },
    ],
  },
  async messageRun(message, args) {
    const channel = message.mentions.channels.first();
    if (!channel) return message.channel.send('Please enter a channel to unlock');

    await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        'SendMessages': null,
      });

    const embed = new EmbedBuilder()
      .setTitle('🔓**Channel Unlocked**🔓')
      .setDescription(`Channel ${channel} was successfully unblocked by ${message.author}`)
      .setColor('#00ff00');

    // Send log to mod log channel
    const modLogChannel = message.guild.channels.cache.get(this.modLogChannelId);
    if (modLogChannel) {
      modLogChannel.send({ embeds: [embed] });
    }

    channel.send({ embeds: [embed] });
  },
  async interactionRun(interaction) {
    const channel = interaction.options.getChannel('channel');

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        'SendMessages': null,
      });

    const embed = new EmbedBuilder()
      .setTitle('🔓**Channel Unlocked**🔓')
      .setDescription(`Channel ${channel} was successfully unblocked by ${interaction.user}`)
      .setColor('#00ff00');

    // Send log to mod log channel
    const modLogChannel = interaction.guild.channels.cache.get(this.modLogChannelId);
    if (modLogChannel) {
      modLogChannel.send({ embeds: [embed] });
    }

    interaction.followUp({ embeds: [embed] });
  },
};