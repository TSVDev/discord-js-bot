const { vUnmuteTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await vUnmuteTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<a:micanimation:1249144379969634334> ${target.user.username}'s voice is unmuted in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `<:info:1249145380973838478> You do not have permission to voice unmute ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:info:1249145380973838478> I do not have permission to voice unmute ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:no:1235502897215836160> ${target.user.username} is not in any voice channel`;
  }
  if (response === "NOT_MUTED") {
    return `<:no:1235502897215836160> ${target.user.username} is not voice muted`;
  }
  return `<:no:1235502897215836160> Failed to voice unmute ${target.user.username}`;
};
