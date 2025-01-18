const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgeuser",
  description: "deletes the specified amount of messages",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<@user|ID> [amount]",
    aliases: ["purgeusers", "pu"],
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0]);
    if (!target) return message.safeReply(`<:No:1330253494447243355> No users found matching " ${args[0]} ". Make sure you input a valid user ID or mention.`);
    const amount = (args.length > 1 && args[1]) || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply("<:Info:1330256387959164928> Numbers are only allowed");
      if (parseInt(amount) > 99) return message.safeReply("<:Info:1330256387959164928> The max amount of messages that I can delete is 99");
    }

    const { channel } = message;
    const response = await purgeMessages(message.member, message.channel, "USER", amount, target);

    if (typeof response === "number") {
      return channel.safeSend(`<:Yes:1330253737687781436> Successfully deleted ${response} messages`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("<:Info:1330256387959164928> I don't have `Read Message History` & `Manage Messages` to delete messages", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("<:Info:1330256387959164928> You don't have `Read Message History` & `Manage Messages` to delete messages", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("<:No:1330253494447243355> No messages found that can be cleaned", 5);
    } else {
      return message.safeReply(`<:No:1330253494447243355> Error occurred! Failed to delete messages`);
    }
  },
};
