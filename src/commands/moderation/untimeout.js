const { unTimeoutTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "untimeout",
  description: "remove timeout from a member",
  category: "MODERATION",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["ut"],
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
        description: "reason for timeout",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`<:no:1235502897215836160> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
    const reason = `${message.author.id} ${args.slice(1).join(" ").trim()}`;
    const response = await untimeout(message.member, target, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");
    const reason = `[${message.author.id}] ${interaction.options.getString("reason")}`;
    const target = await interaction.guild.members.fetch(user.id);

    const response = await untimeout(interaction.member, target, reason);
    await interaction.followUp(response);
  },
};

async function untimeout(issuer, target, reason) {
  const response = await unTimeoutTarget(issuer, target, reason);
  if (typeof response === "boolean") return `<:untimeout:1249144366329757771> Timeout of ${target.user.username} is removed!`;
  if (response === "BOT_PERM") return `<:info:1249145380973838478> I do not have permission to remove timeout of ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `<:info:1249145380973838478> You do not have permission to remove timeout of ${target.user.username}`;
  else if (response === "NO_TIMEOUT") return `<:no:1235502897215836160> ${target.user.username} is not timed out!`;
  else return `<:no:1235502897215836160> Failed to remove timeout of ${target.user.username}`;
}
