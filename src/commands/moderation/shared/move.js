const { moveTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason, channel) => {
  const response = await moveTarget(member, target, reason, channel);
  if (typeof response === "boolean") {
    return `<:Yes:1330253737687781436> ${target.user.username} was successfully moved to: ${channel}`;
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
  if (response === "TARGET_PERM") {
    return `<:No:1330253494447243355> ${target.user.username} doesn't have permission to join ${channel}`;
  }
  if (response === "ALREADY_IN_CHANNEL") {
    return `<:No:1330253494447243355> ${target.user.username} is already connected to ${channel}`;
  }
  if (response === "DM_DISABLED") return `<:Info:1330256387959164928> ${target.user.username} has been kicked, but could not be notified via DM.`;
  return `<:No:1330253494447243355> Failed to move ${target.user.username} to ${channel}`;
};
