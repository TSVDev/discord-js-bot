const { unDeafenTarget } = require("@helpers/ModUtils");

module.exports = async ({ member }, target, reason) => {
  const response = await unDeafenTarget(member, target, reason);
  if (typeof response === "boolean") {
    return `<a:soundanimation:1249144382502998071> ${target.user.username} is undeafened in this server`;
  }
  if (response === "MEMBER_PERM") {
    return `<:info:1249145380973838478> You do not have permission to deafen ${target.user.username}`;
  }
  if (response === "BOT_PERM") {
    return `<:info:1249145380973838478> I do not have permission to deafen ${target.user.username}`;
  }
  if (response === "NO_VOICE") {
    return `<:no:1235502897215836160> ${target.user.username} is not in any voice channel`;
  }
  if (response === "NOT_DEAFENED") {
    return `<:no:1235502897215836160> ${target.user.username} is not deafened`;
  }
  return `<:no:1235502897215836160> Failed to deafen ${target.user.username}`;
};
