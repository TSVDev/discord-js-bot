/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "report",
    description: "Reports a user to staff",
    category: "MODERATION",
    command: {
      enabled: true,
    },
    slashCommand: {
      enabled: true,
      ephemeral: false,
      options: [
        {
            name: "user",
            description: "User to report",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "Reason for reporting",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    
      async messageRun(message, args) {
        const target = await message.guild.resolveMember(args[0], true);
        if (!target) return message.safeReply(`<:no:1235502897215836160> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
        const reason = `${message.content.split(args[0])[1].trim()}`;
    
        if (!channel) return message.channel.send("<:info:1249145380973838478> Please specify a channel to lock");
    
       //Report channel
       const reportChannel = "1287219758197899346";
    
        const embed = new EmbedBuilder()
         .setThumbnail(target.user.displayAvatarURL())
          .setColor("#ff0000")
          .setTitle("**User Reported**")
          .setDescription(`A user has been reported to staff`)
          .addFields(
            {name: `User Reported`, value: `${target}`},
            {name: `Reason`, value: `${reason}`},
          );
          
    
        // Send log to mod log channel
        const modLogChannel = message.guild.channels.cache.get(this.modLogChannelId);
        if (modLogChannel) {
          modLogChannel.send({ embeds: [embed] });
        }
    
        channel.send({ embeds: [embed] });
      },
    
      /*async interactionRun(interaction) {
        const channel = interaction.options.getChannel("channel");
        const reason = interaction.options.getString("reason") || "No reason provided";
    
        
    
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
      },*/
    }