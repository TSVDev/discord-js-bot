const userInfo = require("../shared/user");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "userinfo",
  description: "shows information about the user",
  category: "INFORMATION",
  userPermissions: ["ManageMessages"],
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@member|id]",
    aliases: ["uinfo", "memberinfo", "ui", "whois", "lookup"],
  },

  async messageRun(message, args) {
    if (!args[0]) {
      return message.safeReply("<:No:1330253494447243355> Please provide a valid user ID or mention.");
    }

    let target;

    // Extract the user ID from the mention if it exists
    const userId = args[0].replace(/[<@!>]/g, '');  // This removes <@>, <@!>, and >

    // First, check if the user is a member of the guild
    target = message.guild.members.cache.get(userId);

    // If not found in the cache, fetch the user
    if (!target) {
      try {
        // Try fetching the user using their ID from the client
        target = await message.client.users.fetch(userId);
      } catch (error) {
        // Handle error when user is not found
        return message.safeReply(`<:No:1330253494447243355> No user found matching "${args[0]}". Make sure you input a valid user ID.`);
      }
    }
  
    let response;
    try {
      response = await userInfo(target, message);
      if (!response || (!response.content && !response.embeds)) {
        return message.safeReply("<:No:1330253494447243355> No valid information found for the user.");
      }
    } catch (error) {
      console.error("Error generating user info:", error);
      return message.safeReply("<:No:1330253494447243355> Failed to generate user information.");
    }
    await message.safeReply(response);
  }
};