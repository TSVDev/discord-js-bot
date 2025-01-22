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
      enabled: true,
      ephemeral: true,
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

        await this.handleReport(message.guild, message.channel, message.author, target, reason, message.id);

      },
    
      async interactionRun(interaction) {
        const target = interaction.options.getMember("user");
        const reason = interaction.options.getString("reason");
    
        if (!target)
          return interaction.reply({
            content: `<:No:1330253494447243355> No user found matching the specified user.`,
            ephemeral: true,
          });
    
        await this.handleReport(
          interaction.guild,
          interaction.channel,
          interaction.user,
          target,
          reason,
          interaction.id,
          interaction
        );
      },
    
      async handleReport(guild, channel, reporter, reportedUser, reason, messageId, interaction = null) {

       //Report channel
       const reportChannelId = "1331105725941809173";
       const staffPing = `<@&1259329386289565727>`
    
        const embed = new EmbedBuilder()
         .setThumbnail(reportedUser.user.displayAvatarURL())
          .setColor("#ff0000")
          .setTitle("**User Reported**")
          .setDescription(`🚨 A user has been reported to staff`)
          .addFields(
            {
              name: `User Reported:`,
              value: `__Username:__ ${reportedUser.user.username}\n__ID:__ ${reportedUser.id}\n__Mention:__ <@${reportedUser.id}>`,
              inline: true,
            },
            {
              name: `Reported By:`,
              value: `__Username:__ ${reporter.username}\n__ID:__ ${reporter.id}\n__Mention:__ <@${reporter.id}>`,
              inline: true,
            },
            {
              name: `Reason:`,
              value: `${reason}`,
            },
            {
              name: `Channel Link:`,
              value: `[Click here to view the channel where the report was sent](https://discord.com/channels/${guild.id}/${channel.id})`,
          },
          {
              name: `Message Link:`,
              value: `[Click here to view the report message](https://discord.com/channels/${guild.id}/${channel.id}/${messageId})`,
          }
        );
          
    
        try {
          // Send to the report channel
          const reportChannel = await guild.channels.fetch(reportChannelId);
          if (reportChannel) {
            await reportChannel.send({
              content: `${staffPing}`,
              embeds: [embed],
            });
          }

      // Create the DM embed for the reporter
      const dmEmbed = new EmbedBuilder()
       .setAuthor({ name: "Your Report Has Been Submitted!" })
       .setColor("#FF4500")  // You can customize the color to fit your theme
       .addFields(
          { name: `Reported User:`, value: `${reportedUser.user.username} (${reportedUser.id})` },
          { name: `Reason:`, value: `${reason}` },
          { name: `Channel:`, value: `<#${channel.id}>` },
          { 
            name: `Message Link:`, 
            value: `[Click here to view the report message](https://discord.com/channels/${guild.id}/${channel.id}/${messageId})` 
          }
        )
        .setTimestamp()
        .setFooter({ 
          text: `This has been sent on behalf of the ${guild.name}'s moderation team`,
         });

        try {
          await reporter.send({ embeds: [dmEmbed] });

          if (interaction && !interaction.replied) {
            await interaction.editReply(
              `<:Yes:1330253737687781436> The report has been sent to staff, and you have been notified via DM.`
            );
          } else {
            await channel.send(
              `<:Yes:1330253737687781436> The report has been sent to staff, and the reporter has been notified via DM.`
            );
          }
        } catch (dmError) {

          console.error("Error sending the DM:", dmError);
          if (interaction && !interaction.replied) {
            await interaction.editReply(
              `<a:Notice:1330253581491765359> Your report has been submitted, but we couldn't send you a DM because your DMs are closed.`
            );
          } else {
            await channel.send(
              `<a:Notice:1330253581491765359> Your report has been submitted, but we couldn't send you a DM because your DMs are closed.`
            );
          }
        }
      } catch (error) {
        console.error("Error handling the report:", error);
        if (interaction && !interaction.replied) {
          await interaction.editReply(
            `<:No:1330253494447243355> An error occurred while trying to send the report.`
          );
        } else {
          await channel.send(
            `<:No:1330253494447243355> An error occurred while trying to send the report.`
          );
        }
      }
    },
  };