const { disconnectTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await disconnectTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<:yes:1235503385323769877> ${target.user.username} is disconnected from the voice channel`;
  }
  if (response === "MEMBER_PERM") {
    return `<:info:1249145380973838478> You do not have permission to disconnect ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:info:1249145380973838478> I do not have permission to disconnect ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:no:1235502897215836160> ${target.user.username} is not in any voice channel`;
  }
  return `<:no:1235502897215836160> Failed to disconnect ${target.user.username}`;
};
