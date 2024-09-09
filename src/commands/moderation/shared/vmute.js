const { vMuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vMuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<a:micmutea:1249144381177466953> ${target.user.username}'s voice is muted in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `<:info:1249145380973838478> You do not have permission to voice mute ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:info:1249145380973838478> I do not have permission to voice mute ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:no:1235502897215836160> ${target.user.username} is not in any voice channel`;
  }
  if (response === "ALREADY_MUTED") {
    return `<:no:1235502897215836160> ${target.user.username} is already muted`;
  }
  return `<:no:1235502897215836160> Failed to voice mute ${target.user.username}`;
};
