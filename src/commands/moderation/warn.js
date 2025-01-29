const { warnTarget, incrementCaseCount } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warn",
  description: "warns the specified member",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    aliases: ["w"],
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
        description: "reason for warn",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await warn(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const target = await interaction.guild.members.fetch(user.id);

    const response = await warn(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function warn(issuer, target, reason) {
  const response = await warnTarget(issuer, target, reason);
  if (typeof response === "boolean") return `⚠️ ${target.user.username} is warned!`;
  if (response === "BOT_PERM") return `<:Info:1330256387959164928> I do not have permission to warn ${target.user.username}`;
  if (response === "MEMBER_PERM") return `<:Info:1330256387959164928> You do not have permission to warn ${target.user.username}`;
  if (response === "DM_DISABLED") return `<:Info:1330256387959164928> ${target.user.username} has been warned, but could not be notified via DM.`;
  else return `<:No:1330253494447243355> Failed to warn ${target.user.username}`;
}
