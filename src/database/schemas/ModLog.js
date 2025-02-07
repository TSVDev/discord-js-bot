const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const Schema = new mongoose.Schema(
  {
    guild_id: reqString,
    member_id: String,
    reason: String,
    case_number: {
      type: Number,
      required: true, // Ensure it's always provided
    },
    admin: {
      id: reqString,
      tag: reqString,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "PURGE",
        "WARN",
        "TIMEOUT",
        "UNTIMEOUT",
        "KICK",
        "SOFTBAN",
        "BAN",
        "UNBAN",
        "VMUTE",
        "VUNMUTE",
        "DEAFEN",
        "UNDEAFEN",
        "DISCONNECT",
        "MOVE",
      ],
    },
  },
  {
    versionKey: false,
    autoIndex: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Model = mongoose.model("mod-logs", Schema);

module.exports = {
  model: Model,

  addModLogToDb: async (admin, target, reason, type, caseNumber) =>
    await new Model({
      guild_id: admin.guild.id,
      member_id: target.id,
      reason,
      admin: {
        id: admin.id,
        tag: admin.user.tag,
      },
      type,
      case_number: caseNumber, // Include the case number
    }).save(),

  getWarningLogs: async (guildId, targetId) =>
    Model.find({
      guild_id: guildId,
      member_id: targetId,
      type: "WARN",
    }).lean(),

  clearWarningLogs: async (guildId, targetId) =>
    Model.deleteMany({
      guild_id: guildId,
      member_id: targetId,
      type: "WARN",
    }),
};
