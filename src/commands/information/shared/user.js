const { EmbedBuilder, ActivityPlatform } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { PermissionsBitField } = require('discord.js');
const { Console } = require("console");

/**
 * @param {import('discord.js').GuildMember | import('discord.js').User} member
 * @param {import('discord.js').Message} message
 * 
 * @param {import('@src/structures').BotClient} client
 */
module.exports = async (member, message) => {
  try {
    // Ensure member is a GuildMember or User object
    const isGuildMember = member instanceof require('discord.js').GuildMember;
    const user = member.user || member; // Always use member.user to access user information

  // Fetch user if it's not a GuildMember (the user might not be in the guild)
  let fetchedUser;
  if (!isGuildMember) {
    try {
      fetchedUser = await message.client.users.fetch(user.id);
    } catch (error) {
      await message.safeReply("<:No:1330253494447243355> Failed to fetch user:", error);
      return { content: "<:No:1330253494447243355> Could not retrieve user data." };
    }
  } else {
    fetchedUser = user;
  }

  if (!fetchedUser) {
     return { content: "<:No:1330253494447243355> User not found." };
  }

    let color = isGuildMember ? member.displayHexColor : EMBED_COLORS.BOT_EMBED;

    // Handle roles and other member-specific fields if it's a GuildMember
    let rolesMentions = isGuildMember ? member.roles.cache.map((r) => r.toString()).join(", ") : "N/A";
    if (rolesMentions.length > 1024) rolesMentions = rolesMentions.substring(0, 1020) + "...";

    let topRole = isGuildMember ? member.roles.highest : null;

    const flagNames = {
      Staff: { name: "Discord Employee", emoji: "<:Discordstaff:1330059346821906493>" },
      Partner: { name: "Discord Partner", emoji: "<:Discord_Partner:1330059092026458112>" },
      Hypesquad: { name: "HypeSquad Events Member", emoji: "<:Hypesquadevents:1330393148840480872>" },
      HypeSquadOnlineHouse1: { name: "House Bravery Member", emoji: "<:Hypesquadbravery:1330393177416532008>" },
      HypeSquadOnlineHouse2: { name: "House Brilliance Member", emoji: "<:Hypesquadbrilliance:1330059167339249705>" },
      HypeSquadOnlineHouse3: { name: "House Balance Member", emoji: "<:Hypesquadbalance:1330059279629029446>" },
      BugHunterLevel1: { name: "Bug Hunter Level 1", emoji: "<:Bughunter:1330059205591175249>" },
      BugHunterLevel2: { name: "Bug Hunter Level 2", emoji: "<:GoldBughunter:1330393205845393481>" },
      PremiumEarlySupporter: { name: "Early Supporter", emoji: "<:Earlysupporter:1330059312516829244>" },
      TeamPseudoUser: { name: "Team User", emoji: "<a:Notice:1330253581491765359>" },
      VerifiedBot: { name: "Verified Bot", emoji: "<:Verifiedbadge:1330059151774187560>" },
      VerifiedDeveloper: { name: "Early Verified Bot Developer", emoji: "<:DiscordEarlyBotDeveloper:1330059105137594380>" },
      ActiveDeveloper: { name: "Active Developer", emoji: "<:DiscordActiveDeveloper:1330059119083786334>" },
      CertifiedModerator: { name: "Moderator Programs Alumni", emoji: "<:Discordmoderator:1330059298017116201>" },

      ServerOwner: { name: "Server Owner", emoji: "<:Crown:1330393191622381568>" },
      ServerAdmin: { name: "Server Administrator", emoji: "<:DarkAdminShield:1330586167342665838>" },
      ServerModerator: { name: "Server Moderator", emoji: "<:DarkModShield:1330586188578422945>" },
      BotUser: { name: "Bot User", emoji: "<:DarkBot:1330586265401430177>" },
      BotOwner: { name: "Bot Owner", emoji: "<:DarkCrown:1330586276717662268>" },
      BotManager: { name: "Bot Manager", emoji: ":wrench:" },

      Booster: { name: "Server Booster", emoji: "<:Freeboost:1330059256166092822>" },

      IsTimedout: { name: "Timed Out", emoji: "<:Timeout:1330256600732008602>" },
      IsBanned: { name: "Banned", emoji: "<:Ban:1330256578682818662>" },

      WarningCount: { name: "Warnings", emoji: "<:Warning:1330256481077166203>" },

      VerifiedEmail: { name: "Verified Email", emoji: "<:VerifiedEmail:1330256436242027520>" },

      /*
      Add 
      
      */

    };

    // Function to get readable boosting duration
    function getBoostingDuration(member) {
      if (!member.premiumSince) return null;

      const now = new Date();
      const boostingStart = member.premiumSince;
      const durationMs = now - boostingStart;

      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
      const years = Math.floor(durationDays / 365);
      const months = Math.floor((durationDays % 365) / 30);
      const days = durationDays % 30;

      const parts = [];
      if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
      if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
      if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

      return parts.join(', ');
    }

    // Dynamically check conditions for each flag
    const dynamicFlags = [];

    if (member.premiumSince) {
      const boostingDuration = getBoostingDuration(member);
      flags.push(
        `${flagNames.Booster.emoji} ${flagNames.Booster.name} (${boostingDuration})`
      );
    }

    if (isGuildMember && member.guild.ownerId === member.id) {
      dynamicFlags.push(`${flagNames.ServerOwner.emoji} ${flagNames.ServerOwner.name}`);
    }

    if (
      isGuildMember &&
      (member.permissions.has(PermissionsBitField.Flags.Administrator) || 
      member.permissions.has(PermissionsBitField.Flags.ManageGuild))
    ) {
      dynamicFlags.push(`${flagNames.ServerAdmin.emoji} ${flagNames.ServerAdmin.name}`);
    }

    if (
      isGuildMember &&
      (member.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
      member.permissions.has(PermissionsBitField.Flags.KickMembers) ||
      member.permissions.has(PermissionsBitField.Flags.BanMembers) ||
      member.permissions.has(PermissionsBitField.Flags.ManageMessages))
    ) {
      dynamicFlags.push(`${flagNames.ServerModerator.emoji} ${flagNames.ServerModerator.name}`);
    }

    if (user.bot) {
      dynamicFlags.push(`${flagNames.BotUser.emoji} ${flagNames.BotUser.name}`);
    }

    const botOwnerGuildId = "1254188178030727248";
    const botOwnerRoleId = "1259329386289565727";
    const botManagerRoleId = "1259329242148114463";
    const botOwnerUserId = "528821806556250122";

    // Fetch the TSV Dev guild
    const tsvDevGuild = member.client.guilds.cache.get(botOwnerGuildId);

    // Check if the user has the Bot Owner or Bot Manager role in the TSV Dev guild
    const hasBotOwnerRoleInTsvDev = tsvDevGuild?.members.cache.get(user.id)?.roles.cache.has(botOwnerRoleId);
    const hasBotManagerRoleInTsvDev = tsvDevGuild?.members.cache.get(user.id)?.roles.cache.has(botManagerRoleId);
    
    if (isGuildMember) {
      // Bot Owner Flag
      if ((member.roles.cache.has(botOwnerRoleId) || user.id === botOwnerUserId) || hasBotOwnerRoleInTsvDev) {
        dynamicFlags.push(`${flagNames.BotOwner.emoji} ${flagNames.BotOwner.name}`);
      }
    
      // Bot Manager Flag
      if (hasBotManagerRoleInTsvDev) {
        dynamicFlags.push(`${flagNames.BotManager.emoji} ${flagNames.BotManager.name}`);
      }
    }

    if (isGuildMember && member.communicationDisabledUntil) {
      dynamicFlags.push(`${flagNames.IsTimedout.emoji} ${flagNames.IsTimedout.name}`);
    }

    // Check if the user is banned

    const guild = message.guild;

    try {

      if (!guild) {
        console.error('Guild not found.');
        return;
      }
      const banList = await guild.bans.fetch(); // Fetch the ban list
      const bannedUser = banList.find(banned => banned.user.id === user.id); // Check if the user is in the ban list
    
      if (bannedUser) {
        dynamicFlags.push(`${flagNames.IsBanned.emoji} ${flagNames.IsBanned.name}`); // Add the "Banned" flag
      }
    } catch (error) {
      console.error('Error fetching bans:', error);
      // Optionally, you can handle this case by adding a default flag or sending an error message
    }


    // Combine dynamic flags with static user flags
    const staticFlags = user.flags.toArray();
    const readableStaticFlags = staticFlags
      .map(flag => {
        const flagData = flagNames[flag];
        return flagData ? `${flagData.emoji} ${flagData.name}` : `${flag}`; // If the flag doesn't exist in the map, just show the raw flag name
      });

    const allFlags = [...dynamicFlags, ...readableStaticFlags];
    const flagsList = allFlags.length ? allFlags.join("\n") : "None";

    // Status and device specific emojis
    const statusDeviceEmojis = {
      mobile: {
        online: "<:OnlinePhone:1330271678374215802>",
        idle: "<:IdlePhone:1330271727564882052>",
        dnd: "<:DNDPhone:1330271711811211317>",
        offline: "<:OfflinePhone:1330271740575613018>",
      },
      desktop: {
        online: "<:OnlineDesktop:1330271765674463407>",
        idle: "<:IdleDesktop:1330271799232954491>",
        dnd: "<:DNDDesktop:1330271786620944384>",
        offline: "<:OfflineDesktop:1330271812801663109>",
      },
      web: {
        online: "<:OnlineWeb:1330271544013754390>",
        idle: "<:IdleWeb:1330271638373138462>",
        dnd: "<:DNDWeb:1330271601111077006>",
        offline: "<:OfflineWeb:1330271657536782417>",
      },
    };

     // Initialize status and device information
    let statusAndDevice = "<a:Notice:1330253581491765359> No presence data found for the user.";

    // Check for presence
    if (member.presence) {
      const status = member.presence.status;

      // Device information (mobile, desktop, web)
      if (member.presence.clientStatus) {
        let device = "Unknown Device";
        let deviceEmoji = "<a:Notice:1330253581491765359>";

        if (member.presence.clientStatus.desktop) {
          device = "Desktop";
          deviceEmoji = statusDeviceEmojis.desktop[status] || "<:OfflineDesktop:1330271812801663109>";  // Default to Desktop offline emoji
        } else if (member.presence.clientStatus.mobile) {
          device = "Mobile";
          deviceEmoji = statusDeviceEmojis.mobile[status] || "<:OfflinePhone:1330271740575613018>";  // Default to Mobile offline emoji
        } else if (member.presence.clientStatus.web) {
          device = "Web";
          deviceEmoji = statusDeviceEmojis.web[status] || "<:OfflineWeb:1330271657536782417>";  // Default to Web offline emoji
        }

         // Capitalize status except for DND, which should be uppercase
        const formattedStatus = status === "dnd" ? "DND" : status.charAt(0).toUpperCase() + status.slice(1);

        // Combine status and device emoji into a single string
        statusAndDevice = `${deviceEmoji} ${formattedStatus} on ${device}`;
      }

       // Check for activity and append to status
     if (member.presence.activities && member.presence.activities.length > 0) {
      const activities = member.presence.activities
         .map((activity) => {
          switch (activity.type) {
            case 0: // Playing an activity (ActivityType.PLAYING)
              return `Playing: **${activity.name}**`;
            case 2: // Listening to an activity (ActivityType.LISTENING)
              if (activity.name === "Spotify") {
               // Check if the activity is from Spotify
               return `Listening to: __${activity.details}__ by __${activity.state}__ on ${activity.name}`;
              } else {
               return `Listening to: **${activity.name}**`;
              }
            case 3: // Watching an activity (ActivityType.WATCHING)
              return `Watching: **${activity.name}**`;
            case 1: // Streaming an activity (ActivityType.STREAMING)
              return `Streaming: **${activity.name}**`;
            case 5: // Competing in an activity (ActivityType.COMPETING)
              return `Competing in: **${activity.name}**`;
            case 4: // Custom Status (ActivityType.CUSTOM_STATUS)
              let emojiType = '';
              let emojiText = '';
    
              // Check if the emoji is custom or default
              if (activity.emoji?.id) {
                emojiType = "(Custom Emoji)"; // It's a custom emoji
                emojiText = ''; // Remove the emoji code for custom emojis
              } else if (activity.emoji) {
                emojiType = ''; // No special label for default emoji
                emojiText = activity.emoji.toString(); // Show the default emoji
              }

                // Return the custom status with emoji details
                return `Custom Status: ${emojiText} ${emojiType} **${activity.state}**`;
            default:
              return `Extra **${activity.name}**`;
          }
        });
        activityStatus = activities.join("\n");
        statusAndDevice += ` \n${activityStatus}`;
      }
    }

    // Build the embed
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${user.username} Information`,
        iconURL: user.displayAvatarURL(),
      })
      .setThumbnail(user.displayAvatarURL())
      .setColor(color)
      .addFields(
        {
          name: "Username:",
          value: user.username,
          inline: true,
        },
        {
          name: "Mention:",
          value: `<@${user.id}>`,
          inline: true,
        },
        {
          name: "ID:",
          value: user.id,
          inline: true,
        },
        {
          name: "Status:",
          value: statusAndDevice,
        },
        {
          name: "Discord Registered:",
          value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F> (<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>)`, // Converts to UNIX timestamp and uses Discord's local time and relative format
        },
        {
          name: "Flags:",
          value: flagsList, // Display the nicely formatted flags list
        },
        {
          name: "Avatar-URL:",
          value: `[Download link](${user.displayAvatarURL({ format: "png", size: 2048 })})`,
        }
      );

    // Add guild-specific information only if the user is in the guild
    if (isGuildMember) {
      embed.addFields(
        {
          name: "Guild Joined:",
          value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F> (<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>)`, // Converts to UNIX timestamp and includes relative time
        },
        {
          name: "Top Role:",
          value: topRole ? topRole.toString() : "N/A",
          inline: true,
        },
        {
          name: `Roles: [${member.roles.cache.size}]`,
          value: rolesMentions,
        }
      );
  } else {
      embed.addFields(
        {
          name: "Guild Information:",
          value: "<a:Notice:1330253581491765359> This user is not in the guild.",
        }
      );
  }
  embed.setFooter({ text: `Requested by: ${message.author.username}` })
       .setTimestamp(Date.now());

   // Ensure the embed is not empty
  if (embed.data.fields.length === 0) {
  return { content: "<:No:1330253494447243355> No information available for this user." };
  }

  return { embeds: [embed] };

  } catch (error) {
  console.error("Error in generating embed:", error);
  return { content: `<:No:1330253494447243355> An error occurred: ${error.message}` };
  }
};