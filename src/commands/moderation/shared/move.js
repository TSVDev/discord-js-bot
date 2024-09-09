const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `<:yes:1235503385323769877> ${target.user.username} was successfully moved to: ${channel}`;
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
  if (response === "TARGET_PERM") {
    return `<:no:1235502897215836160> ${target.user.username} doesn't have permission to join ${channel}`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `<:no:1235502897215836160> ${target.user.username} is already connected to ${channel}`;
  }
  return `<:no:1235502897215836160> Failed to move ${target.user.username} to ${channel}`;
};
