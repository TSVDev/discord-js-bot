const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { PermissionsBitField } = require('discord.js');

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
    let isBooster = isGuildMember && member.premiumSince !== null ? "<:Freeboost:1330059256166092822>" : "<:No:1330253494447243355>";

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
      member.permissions.has(PermissionsBitField.Flags.BanMembers))
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
    try {
      const ban = await member.guild.bans.fetch(user.id);
      if (ban) {
        dynamicFlags.push(`${flagNames.IsBanned.emoji} ${flagNames.IsBanned.name}`);
      }
    } catch (error) {
      if (error.code !== 10026) { // Ignore error if user is not banned
        console.error(error);
      }
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

    let statusAndDevice = "<:Offline:1330259872880791695> Offline";  // Default status
    let device = "N/A";      // Default to N/A
    let statusEmoji = "<:Offline:1330259872880791695> Offline";  // Default offline emoji
    let deviceEmoji = "❓ Unknown";  // Default device emoji

    // Status and device specific emojis
    const statusDeviceEmojis = {
      mobile: {
        online: "<:OnlinePhone:1330271678374215802> Online",
        idle: "<:IdlePhone:1330271727564882052> Idle",
        dnd: "<:DNDPhone:1330271711811211317> Do Not Disturb",
        offline: "<:OfflinePhone:1330271740575613018> Offline",
      },
      desktop: {
        online: "<:OnlineDesktop:1330271765674463407> Online",
        idle: "<:IdleDesktop:1330271799232954491> Idle",
        dnd: "<:DNDDesktop:1330271786620944384> Do Not Disturb",
        offline: "<:OfflineDesktop:1330271812801663109> Offline",
      },
      web: {
        online: "<:OnlineWeb:1330271544013754390> Online",
        idle: "<:IdleWeb:1330271638373138462> Idle",
        dnd: "<:DNDWeb:1330271601111077006> Do Not Disturb",
        offline: "<:OfflineWeb:1330271657536782417> Offline",
      },
    };

    // Only check presence if the user is online
    console.log("Fetched User", fetchedUser);
    console.log("Member Presence", member.presence);
    console.log("User Presence", user.presence);
    if (fetchedUser.presence) {
      console.log(fetchedUser.presence);
      const status = fetchedUser.presence.status;
      console.log("Status: ", status);

      // Device information (mobile, desktop, web)
      if (fetchedUser.presence.clientStatus) {
        if (fetchedUser.presence.clientStatus.desktop) {
          device = "Desktop";
          deviceEmoji = statusDeviceEmojis.desktop[status] || "<:OfflineDesktop:1330271812801663109> Offline";  // Default to Desktop offline emoji
        } else if (fetchedUser.presence.clientStatus.mobile) {
          device = "Mobile";
          deviceEmoji = statusDeviceEmojis.mobile[status] || "<:OfflinePhone:1330271740575613018> Offline";  // Default to Mobile offline emoji
        } else if (fetchedUser.presence.clientStatus.web) {
          device = "Web";
          deviceEmoji = statusDeviceEmojis.web[status] || "<:OfflineWeb:1330271657536782417> Offline";  // Default to Web offline emoji
        }
      } else {
        // In case clientStatus is not available, fallback to a generic offline status
        console.log("Client status data is not available.");
      }

      // Combine status and device emoji into a single string
      statusAndDevice = `${deviceEmoji}`;

    } else {
      // If there's no presence data available, fallback to "Offline"
      console.log("No presence data found for the user.");

      // Now you can use `statusAndDevice` to represent both status and device in the embed
      console.log(statusAndDevice);
    }

    console.log("Final status and device:", statusAndDevice);  // For debugging, print the combined string

    // Nitro status
    const nitroStatus = fetchedUser.premiumType === 2 ? "<:Yes:1330253737687781436> Nitro 🌟" : fetchedUser.premiumType === 1 ? "<:Yes:1330253737687781436> Nitro Classic ⭐" : "<:No:1330253494447243355> No Nitro";

    console.log("Nitro Status:", nitroStatus);

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
          value: `**BUGGED** ${statusAndDevice}`,
        },
        {
          name: "Discord Registered:",
          value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F> (<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>)`, // Converts to UNIX timestamp and uses Discord's local time and relative format
        },
        {
          name: "Nitro Status:",
          value: `**BUGGED** ${nitroStatus}`,
          inline: true,
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