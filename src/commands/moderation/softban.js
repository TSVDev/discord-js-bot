const { softbanTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "softban",
  description: "softban the specified member. Kicks and deletes messages",
  category: "MODERATION",
  botPermissions: ["BanMembers"],
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    aliases: ["sb"],
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "user",
        description: "the target member",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: "reason",
        description: "reason for softban",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
    const reason = `[${message.author.id}] ${message.content.split(args[0])[1].trim()}`;
    const response = await softban(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = `[${message.author.id}] ${interaction.options.getString("reason")}`;
    const target = await interaction.guild.members.fetch(user.id);

    const response = await softban(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function softban(issuer, target, reason) {
  const response = await softbanTarget(issuer, target, reason);
  if (typeof response === "boolean") return `<:Ban:1330256578682818662> ${target.user.username} is soft-banned!`;
  if (response === "BOT_PERM") return `<:Info:1330256387959164928> I do not have permission to softban ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `<:Info:1330256387959164928> You do not have permission to softban ${target.user.username}`;
  else if (response === "DM_DISABLED") return `<:Info:1330256387959164928> ${target.user.username} has been softbanned, but could not be notified via DM.`;
  else return `<:No:1330253494447243355> Failed to softban ${target.user.username}`;
}
