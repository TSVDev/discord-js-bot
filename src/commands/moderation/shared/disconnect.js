const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<:Yes:1330253737687781436> ${target.user.username} is disconnected from the voice channel`;
  }
  if (response === "MEMBER_PERM") {
    return `<:Info:1330256387959164928> You do not have permission to disconnect ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:Info:1330256387959164928> I do not have permission to disconnect ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:No:1330253494447243355> ${target.user.username} is not in any voice channel`;
  }
  return `<:No:1330253494447243355> Failed to disconnect ${target.user.username}`;
};
