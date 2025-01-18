const { timeoutTarget } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");
const ems = require("enhanced-ms");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "timeout",
  description: "timeouts the specified member",
  category: "MODERATION",
  botPermissions: ["ModerateMembers"],
  userPermissions: ["ModerateMembers"],
  command: {
    enabled: true,
    aliases: ["t"],
    usage: "<ID|@member> <duration> [reason]",
    minArgsCount: 2,
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
        name: "duration",
        description: "the time to timeout the member for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "reason",
        description: "reason for timeout",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);

    // parse time
    const ms = ems(args[1]);
    if (!ms) return message.safeReply("<:Info:1330256387959164928> Please provide a valid duration. Example: 1d/1h/1m/1s");

    const reason = `[${message.author.id}] ${args.slice(2).join(" ").trim()}`;
    const response = await timeout(message.member, target, ms, reason);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user = interaction.options.getUser("user");

    // parse time
    const duration = interaction.options.getString("duration");
    const ms = ems(duration);
    if (!ms) return interaction.followUp("<:Info:1330256387959164928> Please provide a valid duration. Example: 1d/1h/1m/1s");

    const reason = `[${message.author.id}] ${interaction.options.getString("reason")}`;
    const target = await interaction.guild.members.fetch(user.id);

    const response = await timeout(interaction.member, target, ms, reason);
    await interaction.followUp(response);
  },
};

async function timeout(issuer, target, ms, reason) {
  if (isNaN(ms)) return "<:Info:1330256387959164928> Please provide a valid duration. Example: 1d/1h/1m/1s";
  const response = await timeoutTarget(issuer, target, ms, reason);
  if (typeof response === "boolean") return `<:Timeout:1330256600732008602> ${target.user.username} is timed out!`;
  if (response === "BOT_PERM") return `<:Info:1330256387959164928> I do not have permission to timeout ${target.user.username}`;
  else if (response === "MEMBER_PERM") return `<:Info:1330256387959164928> You do not have permission to timeout ${target.user.username}`;
  else if (response === "ALREADY_TIMEOUT") return `<:No:1330253494447243355> ${target.user.username} is already timed out!`;
  else return `<:No:1330253494447243355> Failed to timeout ${target.user.username}`;
}
