const { deafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await deafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<:SoundMute:1330257693541269655> ${target.user.username} is deafened in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `<:Info:1330256387959164928> You do not have permission to deafen ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:Info:1330256387959164928> I do not have permission to deafen ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:No:1330253494447243355> ${target.user.username} is not in any voice channel`;
  }
  if (response === "ALREADY_DEAFENED") {
    return `<:No:1330253494447243355> ${target.user.username} is already deafened`;
  }
  return `<:No:1330253494447243355> Failed to deafen ${target.user.username}`;
};
