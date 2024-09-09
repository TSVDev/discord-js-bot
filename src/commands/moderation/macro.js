const { PermissionsBitField } = require('discord.js');

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "macro",
  description: "Send macros",
  cooldown: 60,
  category: "MODERATION",
  command: {
    enabled: true,
    aliases: ["m"],
    usage: "<macro>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },

  async messageRun(message, args) {

    const input = args[0].toLowerCase();
    
    const support = "1226459653643309066"
    const staff = "1144359946012590172"
    const sls = "1174813484576424008"

    if (input === "volsup") {
      if (!message.member.roles.cache.has(support)) {
        return message.safeReply("<:info:1249145380973838478> You are missing the 'support' role");
      }
      return message.safeReply(
        "# Please remember\!\nAll support given is by volunteers! No one is required to give you support, and no support should be taken as direct medical advice!\nPlease see <#1144357039301214241> & <#1179418441501909123> for resources on how to contact professional support in your area.");
      }

    else if (input === "assistance"){
      if (!message.member.roles.cache.has(support)) {
        return message.safeReply("<:info:1249145380973838478> You are missing the 'support' role");
      }
      return message.safeReply("Assistance Macro");
    }
    
    else if (input === "sls"){
      if (!message.member.roles.cache.has(sls)) {
        return message.safeReply("<:info:1249145380973838478> You are missing the 'SLS Handler' role");
      }
      return message.safeReply("SLS Handler Macro");
    }

    else if (input === "staff"){
      if (!message.member.roles.cache.has(staff)) {
        return message.safeReply("<:info:1249145380973838478> You are missing the 'staff' role");
      }
      return message.safeReply("Staff Macro");
    }

    else if (input === "emote"){
      return message.safeReply("\<a:pins:1235502858305273856>");
    }

    else {
      return message.safeReply("<:no:1235502897215836160> Unknown Macro");
    }

  },

  async interactionRun(interaction) {
    await interaction.followUp(`Haha get Rick Rolled!\nhttps://tenor.com/view/spoiler-gif-24641133`);
  },
};
