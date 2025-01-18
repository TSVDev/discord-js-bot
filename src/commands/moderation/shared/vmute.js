const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<:MicMute:1330257705964797994> ${target.user.username}'s voice is muted in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `<:Info:1330256387959164928> You do not have permission to voice mute ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:Info:1330256387959164928> I do not have permission to voice mute ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:No:1330253494447243355> ${target.user.username} is not in any voice channel`;
  }
  if (response === "ALREADY_MUTED") {
    return `<:No:1330253494447243355> ${target.user.username} is already muted`;
  }
  return `<:No:1330253494447243355> Failed to voice mute ${target.user.username}`;
};
