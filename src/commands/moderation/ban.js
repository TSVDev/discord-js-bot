const { banTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ban",
  description: "bans the specified member",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
  userPermissions: ["BanMembers"],
  command: {
    enabled: true,
    aliases: ["b"],
    usage: "<ID|@member> [reason]",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for ban",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const match = await message.client.resolveUsers(args[0], true);
    const target = match[0];
    if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
    const reason = `[${message.author.id}] ${message.content.split(args[0])[1].trim()}`;
    const response = await ban(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const target = interaction.options.getUser("user");
    const reason = `[${message.author.id}] ${interaction.options.getString("reason")}`;




    const response = await ban(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} issuer
 * @param {import('discord.js').User} target
 * @param {string} reason
 */
async function ban(issuer, target, reason) {
  const response = await banTarget(issuer, target, reason);

   // Ensure member is a GuildMember or User object
   const isGuildMember = issuer instanceof require('discord.js').GuildMember;
   const user = target.user || target; // Always use member.user to access user information

  // Fetch targetMem and use it for detailed info
  let targetMem;
  if (!isGuildMember) {
    try {
      targetMem = await issuer.client.users.fetch(user.id);
    } catch (error) {
      await message.safeReply("<:No:1330253494447243355> Failed to fetch user:", error);
      return { content: "<:No:1330253494447243355> Could not retrieve user data." };
    }
    } else {
      targetMem = user;
    }

   //let targetMem = await issuer.client.users.fetch(target.id).catch(() => null);

   if (targetMem) {
     const username = targetMem.username;
     const targetID = targetMem.id;
    // Only GuildMember objects will have a `displayName`
    const displayName = isGuildMember ? targetMem.displayName : null;

    // Format the display name
    let displayNameFormatted;
    if (isGuildMember && displayName) {
      // If the user is a guild member, show displayName
      displayNameFormatted = `${username} (${displayName} - ${targetID})`;
    } else {
      // If not a guild member, just show the username and ID
      displayNameFormatted = `${username} (${targetID})`;
    };

  if (typeof response === "boolean") return `<:Ban:1330256578682818662> ${displayNameFormatted} is banned!`;
  if (response === "BOT_PERM") return `<:Info:1330256387959164928> I do not have permission to ban ${displayNameFormatted}`;
  else if (response === "MEMBER_PERM") return `<:Info:1330256387959164928> You do not have permission to ban ${displayNameFormatted}`;
  else if (response === "DM_DISABLED") return `<:Info:1330256387959164928> ${displayNameFormatted} has been banned, but could not be notified via DM.`;
  else return `<:No:1330253494447243355> Failed to ban ${displayNameFormatted}`;
}}
