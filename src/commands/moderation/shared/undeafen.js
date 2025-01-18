const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<:SoundOn:1330257670359486484> ${target.user.username} is undeafened in this server`;
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
  if (response === "NOT_DEAFENED") {
    return `<:No:1330253494447243355> ${target.user.username} is not deafened`;
  }
  return `<:No:1330253494447243355> Failed to deafen ${target.user.username}`;
};
