const { ApplicationCommandOptionType } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "report",
    description: "Reports a user to staff",
    category: "MODERATION",
    command: {
      enabled: true,
      aliases: ["r"],
      usage: "<ID|@member> [reason]",
      minArgsCount: 2,
    },
    slashCommand: {
      enabled: false,
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
        if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
        const reason = `${message.content.split(args[0])[1].trim()}`;
    
    
       //Report channel
       const reportChannel = "1287219758197899346";
       const staffPing = `<@&1259329386289565727>`
    
        const embed = new EmbedBuilder()
         .setThumbnail(target.user.displayAvatarURL())
          .setColor("#ff0000")
          .setTitle("**User Reported**")
          .setDescription(`🚨 A user has been reported to staff`)
          .addFields(
            {
              name: `User Reported:`,
              value: `__Username:__ ${target.user.username}\n__ID:__ ${target.id}\n__Ping:__ <@${target.id}>`,
              inline: true,
            },
            {
              name: `Reported By:`,
              value: `__Username:__ ${message.author.username}\n__ID:__ ${message.author.id}\n__Ping:__ <@${message.author.id}>`,
              inline: true,
            },
            {
              name: `Reason:`,
              value: `${reason}`,
            },
            {
              name: `Channel Link:`,
              value: `[Click here to view the channel where the report was sent](https://discord.com/channels/${message.guild.id}/${message.channel.id})`,
          },
          {
              name: `Message Link:`,
              value: `[Click here to view the report message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`,
          }
          );
          
    
        // Send log to mod log channel
        const modLogChannel = message.guild.channels.cache.get(this.modLogChannelId);
        if (modLogChannel) {
          modLogChannel.send({ embeds: [embed] });
        }
        
      try {
        // Send to the report channel
        const channel = await message.guild.channels.fetch(reportChannel); // Fetch the report channel by ID
          await channel.send({
            content: `${staffPing}`,  // Text content
            embeds: [embed]  // Embed content
        });

      // Create the DM embed for the reporter
      const dmEmbed = new EmbedBuilder()
       .setAuthor({ name: "Your Report Has Been Submitted!" })
       .setColor("#FF4500")  // You can customize the color to fit your theme
       .addFields(
          { name: `Reported User:`, value: `${target.user.username} (${target.id})` },
          { name: `Reason:`, value: `${reason}` },
          { name: `Channel:`, value: `<#${message.channel.id}>` },
          { name: `Message Link:`, value: `[Click here to view the report message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})` }
        )
        .setTimestamp()
        .setFooter({ text: `This has been sent on behalf of the Space Labs Moderation team` });

      // Attempt to send the DM to the reporter
      try {
        await message.author.send({ embeds: [dmEmbed] });
        await message.channel.send("<:Yes:1330253737687781436> The report has been sent to staff and the reporter has been notified via DM.");
        } catch (dmError) {
        // If the DM can't be sent (e.g., user has DMs disabled)
        await message.channel.send("<a:Notice:1330253581491765359> Your report has been submitted, but we couldn't send you a DM because your DMs are closed.");
        console.error("Error sending DM:", dmError);
        }

        } catch (error) {
          console.error(error);
          await message.safeReply("<:No:1330253494447243355> An error occurred while trying to send the report.");
        }
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