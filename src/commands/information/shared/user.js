const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

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
    let isHuman = user.bot ? "<:No:1330253494447243355>" : "<:Yes:1330253737687781436>";
    let isServerOwner = isGuildMember && member.guild.ownerId === member.id ? "<:Yes:1330253737687781436>" : "<:No:1330253494447243355>";

    let roleId = "1259329242148114463"; // Replace with the actual role ID
    let isBotHandler = isGuildMember && member.roles.cache.has(roleId) ? "<:Yes:1330253737687781436>" : "<:No:1330253494447243355>";

    const flagNames = {
      Staff: { name: "Discord Employee", emoji: "<:Discordstaff:1330059346821906493>" },
      Partner: { name: "Discord Partner", emoji: "<:Discord_Partner:1330059092026458112>" },
      HypeSquad: { name: "HypeSquad Events Member", emoji: "<a:Notice:1330253581491765359>" },
      HypeSquadOnlineHouse1: { name: "House Bravery Member", emoji: "<:hypesquad:123456789012345678>" },
      HypeSquadOnlineHouse2: { name: "House Brilliance Member", emoji: "<:Hypesquadbrilliance:1330059167339249705>" },
      HypeSquadOnlineHouse3: { name: "House Balance Member", emoji: "<:Hypesquadbalance:1330059279629029446>" },
      BugHunterLevel1: { name: "Bug Hunter Level 1", emoji: "<:Bughunter:1330059205591175249>" },
      BugHunterLevel2: { name: "Bug Hunter Level 2", emoji: "<a:Notice:1330253581491765359>" },
      PremiumEarlySupporter: { name: "Early Supporter", emoji: "<:Earlysupporter:1330059312516829244>" },
      TeamPseudoUser: { name: "Team User", emoji: "<a:Notice:1330253581491765359>" },
      VerifiedBot: { name: "Verified Bot", emoji: "<:Verifiedbadge:1330059151774187560>" },
      VerifiedDeveloper: { name: "Verified Developer", emoji: "<:DiscordEarlyBotDeveloper:1330059105137594380>" },
      ActiveDeveloper: { name: "Active Developer", emoji: "<:DiscordActiveDeveloper:1330059119083786334>" },
      CertifiedModerator: { name: "Moderator Programs Alumni", emoji: "<:Discordmoderator:1330059298017116201>" },
    };

    // Get the flags and map them to their readable names with custom emojis
    const flags = user.flags.toArray();
    const readableFlags = flags
      .map(flag => {
        const flagData = flagNames[flag];
        return flagData ? `${flagData.emoji} ${flagData.name}` : `${flag}`; // If the flag doesn't exist in the map, just show the raw flag name
      })
      .join("\n"); // Join each flag on a new line

    // If no flags, show "None"
    const flagsList = readableFlags.length ? readableFlags : "None";

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
          name: "Ping:",
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
          value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:F>`, // Converts to UNIX timestamp and uses Discord's local time format
        },
        {
          name: "Human:",
          value: isHuman,
          inline: true,
        },
        {
          name: "Nitro Status:",
          value: nitroStatus,
          inline: true,
        },
        {
          name: "Discord Flags:",
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
          value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>`, // Converts to UNIX timestamp and uses Discord's local time format
        },
        {
          name: "Top Role:",
          value: topRole ? topRole.toString() : "N/A",
          inline: true,
        },
        {
          name: "Booster:",
          value: isBooster,
          inline: true,
        },
        {
          name: "Server Owner:",
          value: isServerOwner,
          inline: true,
        },
        {
          name: "Bot Handler:",
          value: isBotHandler,
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