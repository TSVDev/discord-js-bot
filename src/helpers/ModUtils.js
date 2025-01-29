const { Collection, EmbedBuilder, GuildMember } = require("discord.js");
const { MODERATION } = require("@root/config");

// Utils
const { containsLink } = require("@helpers/Utils");
const { error } = require("@helpers/Logger");

// Schemas
const { getSettings } = require("@schemas/Guild");
const { getMember } = require("@schemas/Member");
const { addModLogToDb } = require("@schemas/ModLog");
/* const ModLog = require('@schemas/ModLog'); // Adjust path to ModLog.js

console.log("ModLog output:", ModLog);*/

  /**
   * Increment the moderation case count for the guild
   * @param {import('discord.js').Guild} guild - The guild where the moderation action occurs
   * @returns {Promise<number>} The new case number
   */
  const incrementCaseCount = async(guild) => {
    try {
      const settings = await getSettings(guild);
      settings.moderation_case_count = (settings.moderation_case_count || 0) + 1;
      await settings.save();
      return settings.moderation_case_count;
    } catch (error) {
      console.error("Error incrementing case count:", error);
      throw new Error("Failed to increment case count.");
    }
  };

  /**
   * Get moderation stats for a user
   * @param {string} userId - The user's ID to fetch moderation stats
   * @param {string} guildId - The guild ID to fetch stats for
   * @returns {Object} Summary of moderation stats
   */
  /*const getModerationStats = async(userId, guildId) => {
    const modLogs = await ModLog.find({ guild_id: guildId, user_id: userId }).lean();

    if (!modLogs || modLogs.length === 0) {
      return { totalCases: 0, caseBreakdown: {} };
    }

    const caseBreakdown = modLogs.reduce((summary, log) => {
      summary[log.type] = (summary[log.type] || 0) + 1;
      return summary;
    }, {});

    return {
      totalCases: modLogs.length,
      caseBreakdown,
    };
  };
//};*/

const DEFAULT_TIMEOUT_HOURS = 24; //hours

const memberInteract = (issuer, target) => {
  const { guild } = issuer;
  if (guild.ownerId === issuer.id) return true;
  if (guild.ownerId === target.id) return false;
  return issuer.roles.highest.position > target.roles.highest.position;
};

/**
 * Send logs to the configured channel and stores in the database
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').GuildMember|import('discord.js').User} target
 * @param {string} reason
 * @param {string} type
 * @param {Object} data
 */
const logModeration = async (issuer, target, reason, type, data = {}) => {
  if (!type) return;
  const { guild } = issuer;

  // Fetch guild settings and the current moderation case count
  const settings = await getSettings(guild);
  settings.moderation_case_count = (settings.moderation_case_count || 0) + 1;
  const caseNumber = settings.moderation_case_count;

  // Save the updated case count to the database
  await settings.save();

  let logChannel;
  if (settings.modlog_channel) logChannel = guild.channels.cache.get(settings.modlog_channel);

   // Emoji mapping for moderation actions
   const actionEmojis = {
    PURGE: "<:Delete:1332467983196491827>",
    TIMEOUT: "<:Timeout:1330256600732008602>",
    UNTIMEOUT: "<:Untimeout:1330257623748055131>",
    KICK: "<:LeaveGuild:1332490264073211914>",
    SOFTBAN: "<:RedCross:1332490731511742516>",
    BAN: "<:Ban:1330256578682818662>",
    UNBAN: "<:GreenUnlockedLeft:1332493186035355739>",
    VMUTE: "<:MicMute:1330257705964797994>",
    VUNMUTE: "<:MicOn:1330257681306488842>",
    DEAFEN: "<:SoundMute:1330257693541269655>",
    UNDEAFEN: "<:SoundOn:1330257670359486484>",
    DISCONNECT: "<:Disconnect:1332467641973211267>",
    MOVE: "<:4729startvoicecalldark:1332490875254734889>",
  };

  // Get the emoji for the action type
  const actionEmoji = actionEmojis[type.toUpperCase()] || "⚠️";


  const embed = new EmbedBuilder()
  .setFooter({
    text: `By ${issuer.displayName} • ${issuer.id}`,
    iconURL: issuer.displayAvatarURL(),
  })
  .setTimestamp(); // This will automatically add the current timestamp to the footer

  const fields = [];
  switch (type.toUpperCase()) {
    case "PURGE":
      embed.setAuthor({ name: `${actionEmoji} Moderation - ${type}` });
      fields.push(
        { name: "Purge Type", value: data.purgeType, inline: true },
        { name: "Messages", value: data.deletedCount.toString(), inline: true },
        { name: "Channel", value: `#${data.channel.name} [${data.channel.id}]`, inline: false }
      );
      break;

    case "TIMEOUT":
      embed.setColor(MODERATION.EMBED_COLORS.TIMEOUT);
      break;

    case "UNTIMEOUT":
      embed.setColor(MODERATION.EMBED_COLORS.UNTIMEOUT);
      break;

    case "KICK":
      embed.setColor(MODERATION.EMBED_COLORS.KICK);
      break;

    case "SOFTBAN":
      embed.setColor(MODERATION.EMBED_COLORS.SOFTBAN);
      break;

    case "BAN":
      embed.setColor(MODERATION.EMBED_COLORS.BAN);
      break;

    case "UNBAN":
      embed.setColor(MODERATION.EMBED_COLORS.UNBAN);
      break;

    case "VMUTE":
      embed.setColor(MODERATION.EMBED_COLORS.VMUTE);
      break;

    case "VUNMUTE":
      embed.setColor(MODERATION.EMBED_COLORS.VUNMUTE);
      break;

    case "DEAFEN":
      embed.setColor(MODERATION.EMBED_COLORS.DEAFEN);
      break;

    case "UNDEAFEN":
      embed.setColor(MODERATION.EMBED_COLORS.UNDEAFEN);
      break;

    case "DISCONNECT":
      embed.setColor(MODERATION.EMBED_COLORS.DISCONNECT);
      break;

    case "MOVE":
      embed.setColor(MODERATION.EMBED_COLORS.MOVE);
      break;
  }

  if (type.toUpperCase() !== "PURGE") {
    embed.setAuthor({ name: `${actionEmoji} Moderation - ${type}` }).setThumbnail(target.displayAvatarURL());

    if (target instanceof GuildMember) {
      fields.push({ name: "Member", value: `${target.displayName} [${target.id}]`, inline: false });
    } else {
      fields.push({ name: "User", value: `${target.tag} [${target.id}]`, inline: false });
    }

    fields.push(
      { name: "Reason", value: reason || "No reason provided", inline: false },
      { name: "Case Number", value: `#${caseNumber}`, inline: true }
    );

    if (type.toUpperCase() === "TIMEOUT") {
      fields.push({
        name: "Expires",
        value: `<t:${Math.round(target.communicationDisabledUntilTimestamp / 1000)}:R>`,
        inline: true,
      });
    }
    if (type.toUpperCase() === "MOVE") {
      fields.push({ name: "Moved to", value: data.channel.name, inline: true });
    }
  }

  embed.setFields(fields);

  await addModLogToDb(issuer, target, reason, type.toUpperCase(), caseNumber);
  
  if (logChannel) {
    try { logChannel.safeSend({ embeds: [embed] });
    } catch (error) {
      console.error("Error sending moderation log:", error);
    }
  }
  return caseNumber; // Ensure caseNumber is returned
};

module.exports = class ModUtils {
  /**
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   */
  static canModerate(issuer, target) {
    return memberInteract(issuer, target);
  }

  /**
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   * @param {"TIMEOUT"|"KICK"|"SOFTBAN"|"BAN"} action
   */
  static async addModAction(issuer, target, reason, action) {
    switch (action) {
      case "TIMEOUT":
        return ModUtils.timeoutTarget(issuer, target, DEFAULT_TIMEOUT_HOURS * 60 * 60 * 1000, reason);

      case "KICK":
        return ModUtils.kickTarget(issuer, target, reason);

      case "SOFTBAN":
        return ModUtils.softbanTarget(issuer, target, reason);

      case "BAN":
        return ModUtils.banTarget(issuer, target, reason);
    }
  }
  /**
   * Delete the specified number of messages matching the type
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').BaseGuildTextChannel} channel
   * @param {"ATTACHMENT"|"BOT"|"LINK"|"TOKEN"|"USER"|"ALL"} type
   * @param {number} amount
   * @param {any} argument
   */
  static async purgeMessages(issuer, channel, type, amount, argument) {
    if (!channel.permissionsFor(issuer).has(["ManageMessages", "ReadMessageHistory"])) {
      return "MEMBER_PERM";
    }

    if (!channel.permissionsFor(issuer.guild.members.me).has(["ManageMessages", "ReadMessageHistory"])) {
      return "BOT_PERM";
    }

    const toDelete = new Collection();

    try {
      const messages = await channel.messages.fetch({ limit: amount, cache: false, force: true });

      for (const message of messages.values()) {
        if (toDelete.size >= amount) break;
        if (!message.deletable) continue;
        if (message.createdTimestamp < Date.now() - 1209600000) continue; // skip messages older than 14 days

        if (type === "ALL") {
          toDelete.set(message.id, message);
        } else if (type === "ATTACHMENT") {
          if (message.attachments.size > 0) {
            toDelete.set(message.id, message);
          }
        } else if (type === "BOT") {
          if (message.author.bot) {
            toDelete.set(message.id, message);
          }
        } else if (type === "LINK") {
          if (containsLink(message.content)) {
            toDelete.set(message.id, message);
          }
        } else if (type === "TOKEN") {
          if (message.content.includes(argument)) {
            toDelete.set(message.id, message);
          }
        } else if (type === "USER") {
          if (message.author.id === argument) {
            toDelete.set(message.id, message);
          }
        }
      }

      if (toDelete.size === 0) return "NO_MESSAGES";
      if (toDelete.size === 1 && toDelete.first().author.id === issuer.id) {
        await toDelete.first().delete();
        return "NO_MESSAGES";
      }

      const deletedMessages = await channel.bulkDelete(toDelete, true);
      await logModeration(issuer, "", "", "Purge", {
        purgeType: type,
        channel: channel,
        deletedCount: deletedMessages.size,
      });

      return deletedMessages.size;
    } catch (ex) {
      error("purgeMessages", ex);
      return "ERROR";
    }
  }

  /**
   * warns the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async warnTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    try {

      const caseNumber = await logModeration(issuer, target, reason, "Warn");

      const memberDb = await getMember(issuer.guild.id, target.id);
      memberDb.warnings += 1;
      const settings = await getSettings(issuer.guild);

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Warned!" })
        .setColor(MODERATION.EMBED_COLORS.TIMEOUT)
        .setDescription(`Please review our <#1144357039301214239> and make sure you're familiar with them!`)
        .addFields(
          {name:`Reason:`, value: `${reason}`},
          { name: `Case Number:`, value: `#${caseNumber}` },
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            console.warn(`Failed to send DM to ${target.user.tag}: DMs are disabled.`);
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          } else {
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
          dmSent = false; // Unexpected error also prevents DM
          }
        }

      //await target.user.send(`⚠️ You have been warned!\n Reason: ${reason}`).catch((ex) => {});

      // check if max warnings are reached
      if (memberDb.warnings >= settings.max_warn.limit) {
        await ModUtils.addModAction(issuer.guild.members.me, target, "⚠️ Max warnings reached", settings.max_warn.action); // moderate
        memberDb.warnings = 0; // reset warnings
      }

      await memberDb.save();

      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error("warnTarget", ex);
      return "ERROR";
    }
  }

  /**
   * Timeouts(aka mutes) the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {number} ms
   * @param {string} reason
   */

  static async timeoutTarget(issuer, target, ms, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";
    if (target.communicationDisabledUntilTimestamp - Date.now() > 0) return "ALREADY_TIMEOUT";

    try {
      await target.timeout(ms, reason);

      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");
  
      console.log(dmReason); // Output: "This is a message ."

      const tt = `<t:${Math.round(target.communicationDisabledUntilTimestamp / 1000)}:R>`

      const caseNumber = await logModeration(issuer, target, dmReason, "Timeout");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Timedout!" })
        .setColor(MODERATION.EMBED_COLORS.TIMEOUT)
        .setDescription(`Please review our <#1144357039301214239> and make sure you're familiar with them!`)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
        {name:`Expires:`, value: `${tt}`},
        { name: `Case Number:`, value: `#${caseNumber}` }
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      //await target.user.send(`<:Timeout:1330256600732008602> You have been timed out!\n Reason: ${dmReason}\n Expires: ${tt}`).catch((ex) => {});

      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error("timeoutTarget", ex);
      return "ERROR";
    }
  }

  /**
   * Untimeouts(aka unmutes) the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async unTimeoutTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";
    if (target.communicationDisabledUntilTimestamp - Date.now() < 0) return "NO_TIMEOUT";
    
    try {
      await target.timeout(null, reason);

      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");
  
      console.log(dmReason); // Output: "This is a message ."

      const caseNumber = await logModeration(issuer, target, dmReason, "UnTimeout");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Untimedout!" })
        .setColor(MODERATION.EMBED_COLORS.UNTIMEOUT)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      //await target.user.send(`<:Untimeout:1330257623748055131> You have been untimed out!\n Reason: ${dmReason}`).catch((ex) => {});
      
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error("unTimeoutTarget", ex);
      return "ERROR";
    }
  }

  /**
   * kicks the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async kickTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";
    
    try {
      

      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "Kick");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Kicked!" })
        .setColor(MODERATION.EMBED_COLORS.KICK)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

        await target.kick(reason);

      //await target.user.send(`👢 You have been kicked!\n Reason: ${dmReason}`).catch((ex) => {});
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }
      
      /*return true;*/
    } catch (ex) {
      error("kickTarget", ex);
      return "ERROR";
    }
  }

  /**
   * Softbans the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async softbanTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    try {
      
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "Softban");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Softbanned!" })
        .setColor(MODERATION.EMBED_COLORS.SOFTBAN)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      await target.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason });
      await issuer.guild.members.unban(target.user);
      
      //await target.user.send(`<:Ban:1330256578682818662> You have been softbanned!\n Reason: ${dmReason}`).catch((ex) => {});
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error("softbanTarget", ex);
      return "ERROR";
    }
  }

  /**
   * Bans the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').User} target
   * @param {string} reason
   * @returns {Promise<EmbedBuilder>}
   */
  static async banTarget(issuer, target, reason) {
    let targetMem;
    try{
      targetMem = await issuer.client.members.fetch(target.id).catch(() => {});
    } catch (err) {
      //User is not a member of the server
      targetMem = null;
    }

     // Check if the target is a member of the guild
    let targetGuildMem;
    try {
      targetGuildMem = await issuer.guild.members.fetch(target.id).catch(() => {});
    } catch (err) {
      targetGuildMem = null;
    }

    // If target is a member of the guild, check for permissions
    if (targetGuildMem) {
      if (!memberInteract(issuer, targetGuildMem)) return "MEMBER_PERM";
      if (!memberInteract(issuer.guild.members.me, targetGuildMem)) return "BOT_PERM";
    }

    try {
     
      // Process reason, removing special formatting like brackets
      let dmReason = reason.replace(/\[.*\]/, "");

      // Log the moderation action
      const caseNumber = await logModeration(issuer, target, dmReason, "Ban");

      // Attempt to send a DM notification
      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Banned!" })
        .setColor(MODERATION.EMBED_COLORS.BAN)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});
        
        let dmSent = false;
        try {
          await target.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

        await issuer.guild.bans.create(target.id, { deleteMessageSeconds: 60 * 60 * 24 * 7, reason });

        
        //await target.user.send(`<:Ban:1330256578682818662> You have been banned!\n Reason: ${dmReason}`).catch((ex) => {});
      
       if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error(`banTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Unbans the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').User} target
   * @param {string} reason
   */
  static async unBanTarget(issuer, target, reason) {
    try {
      // Check if the target is banned before attempting to unban
      const bans = await issuer.guild.bans.fetch({cache: false}); // Fetch all bans
      const isBanned = bans.has(target.id); // Check if the target is banned
  
      if (!isBanned) {
        return "NOT_BANNED";
      }
  
      // Proceed with unbanning if the user is banned
      await issuer.guild.bans.remove(target, reason);
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "UnBan");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Unbanned!" })
        .setColor(MODERATION.EMBED_COLORS.UNBAN)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }
      
        if (dmSent === true) {
          return true;
        } else if (dmSent === false) {
          return "DM_DISABLED";
        }

    } catch (ex) {
      error(`unBanTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Voice mutes the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async vMuteTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (target.voice.mute) return "ALREADY_MUTED";

    try {
      await target.voice.setMute(true, reason);
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "Vmute");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Muted!" })
        .setColor(MODERATION.EMBED_COLORS.VMUTE)
        .setDescription(`Please review our <#1144357039301214239> and make sure you're familiar with them!`)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      //await target.user.send(`<:MicMute:1330257705964797994> You have been VC Muted!\n Reason: ${dmReason}`).catch((ex) => {});
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }
      
    } catch (ex) {
      error(`vMuteTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Voice unmutes the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async vUnmuteTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (!target.voice.mute) return "NOT_MUTED";

    try {
      await target.voice.setMute(false, reason);
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "Vunmute");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Unmuted!" })
        .setColor(MODERATION.EMBED_COLORS.VUNMUTE)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

        if (dmSent === true) {
          return true;
        } else if (dmSent === false) {
          return "DM_DISABLED";
        }

      } catch (ex) {
        error(`vMuteTarget`, ex);
        return "ERROR";
      }
    }
  /**
   * Deafens the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async deafenTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (target.voice.deaf) return "ALREADY_DEAFENED";

    try {
      await target.voice.setDeaf(true, reason);
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "Deafen");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Deafened!" })
        .setColor(MODERATION.EMBED_COLORS.DEAFEN)
        .setDescription(`Please review our <#1144357039301214239> and make sure you're familiar with them!`)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      //await target.user.send(`<:SoundMute:1330257693541269655> You have been VC Deafened!\n Reason: ${dmReason}`).catch((ex) => {});
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error(`deafenTarget`, ex);
      return `<:No:1330253494447243355> Failed to deafen ${target.user.tag}`;
    }
  }

  /**
   * UnDeafens the target and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async unDeafenTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";
    if (!target.voice.deaf) return "NOT_DEAFENED";

    try {
      await target.voice.setDeaf(false, reason);
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "unDeafen");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Undeafened!" })
        .setColor(MODERATION.EMBED_COLORS.UNDEAFEN)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      //await target.user.send(`<:SoundOn:1330257670359486484> You have been VC Undeafened!\n Reason: ${dmReason}`).catch((ex) => {});
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error(`unDeafenTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Disconnects the target from voice channel and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   */
  static async disconnectTarget(issuer, target, reason) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice.channel) return "NO_VOICE";

    try {
      await target.voice.disconnect(reason);
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");

      const caseNumber = await logModeration(issuer, target, dmReason, "Disconnect");

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Disconnected!" })
        .setColor(MODERATION.EMBED_COLORS.DISCONNECT)
        .setDescription(`Please review our <#1144357039301214239> and make sure you're familiar with them!`)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
          
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      //await target.user.send(`🚫 You have been VC Disconnected!\n Reason: ${dmReason}`).catch((ex) => {});
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }

    } catch (ex) {
      error(`unDeafenTarget`, ex);
      return "ERROR";
    }
  }

  /**
   * Moves the target to another voice channel and logs to the database, channel
   * @param {import('discord.js').GuildMember} issuer
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   * @param {import('discord.js').VoiceChannel|import('discord.js').StageChannel} channel
   */
  static async moveTarget(issuer, target, reason, channel) {
    if (!memberInteract(issuer, target)) return "MEMBER_PERM";
    if (!memberInteract(issuer.guild.members.me, target)) return "BOT_PERM";

    if (!target.voice?.channel) return "NO_VOICE";
    if (target.voice.channelId === channel.id) return "ALREADY_IN_CHANNEL";

    if (!channel.permissionsFor(target).has(["ViewChannel", "Connect"])) return "TARGET_PERM";

    try {
      await target.voice.setChannel(channel, reason);
      
      // Remove a section based on a pattern
      let dmReason = reason.replace(/\[.*\]/, "");
  
      console.log(dmReason); // Output: "This is a message ."

      const caseNumber = await logModeration(issuer, target, dmReason, "Move", { channel });

      if (!caseNumber) {
        console.error("Failed to retrieve case number from logModeration");
      }

      const dmEmbed = new EmbedBuilder()
        .setAuthor({ name: "You Have Been Moved!" })
        .setColor(MODERATION.EMBED_COLORS.MOVE)
        .addFields(
          {name:`Reason:`, value: `${dmReason}`},
          {name:`Channel:`, value: `${channel}`},
          { name: `Case Number:`, value: `#${caseNumber}` }
        )
        .setTimestamp()
        .setFooter({text: `This has been sent on behalf of the ${issuer.guild.name}\'s moderation team`});

        let dmSent = false;
        try {
          await target.user.send({ embeds: [dmEmbed] });
          dmSent = true; // DM sent successfully
        } catch (ex) {
          if (ex.code === 50007) { // Discord API Error: Cannot send messages to this user
            /*return "DM_DISABLED"; // Return early if DM can't be sent*/
            dmSent = false; // DM can't be sent
          }
          /*throw ex; // Unexpected error, rethrow it*/
          console.error("Error sending DM:", ex);
        }

      //await target.user.send(`📞 You have been VC Moved!\n Reason: ${dmReason}`).catch((ex) => {});
      if (dmSent === true) {
        return true;
      } else if (dmSent === false) {
        return "DM_DISABLED";
      }
      
    } catch (ex) {
      error(`moveTarget`, ex);
      return "ERROR";
    }
  }
}

module.exports = {
  //ModUtils,
  incrementCaseCount,
  //getModerationStats,
};

