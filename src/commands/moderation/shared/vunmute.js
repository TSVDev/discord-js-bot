const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<:MicOn:1330257681306488842> ${target.user.username}'s voice is unmuted in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `<:Info:1330256387959164928> You do not have permission to voice unmute ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:Info:1330256387959164928> I do not have permission to voice unmute ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:No:1330253494447243355> ${target.user.username} is not in any voice channel`;
  }
  if (response === "NOT_MUTED") {
    return `<:No:1330253494447243355> ${target.user.username} is not voice muted`;
  }
  if (response === "DM_DISABLED") return `<:Info:1330256387959164928> ${target.user.username} has been kicked, but could not be notified via DM.`;
  return `<:No:1330253494447243355> Failed to voice unmute ${target.user.username}`;
};
