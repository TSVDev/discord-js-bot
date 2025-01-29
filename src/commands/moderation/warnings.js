const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getWarningLogs, clearWarningLogs } = require("@schemas/ModLog");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warnings",
  description: "list or clear user warnings",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    aliases: ["aw", "warns", "all warns"],
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "list [member]",
        description: "list all warnings for a user",
      },
      {
        trigger: "clear <member>",
        description: "clear all warnings for a user",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "list",
        description: "list all warnings for a user",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the target member",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: "clear",
        description: "clear all warnings for a user",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "the target member",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response = "";

    if (sub === "list") {
      const target = (await message.guild.resolveMember(args[1], true)) || message.member;
      if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching ${args[1]}. Make sure you input a valid user ID or mention.`);
      response = await listWarnings(target, message);
    }

    //
    else if (sub === "clear") {
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply(`<:No:1330253494447243355> No user found matching ${args[1]}. Make sure you input a valid user ID or mention.`);
      response = await clearWarnings(target, message);
    }

    // else
    else {
      response = `❔ Invalid subcommand ${sub}`;
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response = "";

    if (sub === "list") {
      const user = interaction.options.getUser("user");
      const target = (await interaction.guild.members.fetch(user.id)) || interaction.member;
      response = await listWarnings(target, interaction);
    }

    //
    else if (sub === "clear") {
      const user = interaction.options.getUser("user");
      const target = await interaction.guild.members.fetch(user.id);
      response = await clearWarnings(target, interaction);
    }

    // else
    else {
      response = `❔ Invalid subcommand ${sub}`;
    }

    await interaction.followUp(response);
  },
};

async function listWarnings(target, { guildId }) {
  if (!target) return "<:No:1330253494447243355> No user provided. Make sure you input a valid user ID or mention.";
  if (target.user.bot) return "<:bot:1247839084030722109> Bots don't have warnings";

  const warnings = await getWarningLogs(guildId, target.id);
  if (!warnings.length) return `😇 ${target.user.username} has no warnings`;

  const acc = warnings.map((warning, i) =>{
     // Format the timestamp for a more user-friendly format (e.g., "Sep 23, 2024, 1:07 AM")
     const formattedTimestamp = new Date(warning.created_at).toLocaleString();
  return `**Case #${warning.case_number || 'N/A'}: ${warning.reason}**\nModerator: <@${warning.admin.id}> \nID: (${warning.admin.id}) \nTime: \`${formattedTimestamp}\``;
}).join("\n");

  const embed = new EmbedBuilder({
    author: { name: `${target.user.username}'s warnings:` },
    description: acc,
    
  })
    .setTimestamp()
    .setFooter({ text: `End of Warnings` });
  return { embeds: [embed] };
}

async function clearWarnings(target, { guildId }) {
  if (!target) return "<:No:1330253494447243355> No user provided. Make sure you input a valid user ID or mention.";
  if (target.user.bot) return "<:bot:1247839084030722109> Bots don't have warnings";

  const memberDb = await getMember(guildId, target.id);
  memberDb.warnings = 0;
  await memberDb.save();

  await clearWarningLogs(guildId, target.id);
  return `🧼 ${target.user.username}'s warnings record has been cleaned`;
}
