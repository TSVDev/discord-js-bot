const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    reportId: { type: Number, unique: true, required: true, index: true }, 
    reporterId: { type: String, required: true, index: true },
    reporterUser: {
        id: { type: String, required: true },
        username: { type: String, required: true },
        avatar: { type: String }
    },
    reportedUserId: { type: String, required: true, index: true },
    reportedUser: {
        id: { type: String, required: true },
        username: { type: String, required: true },
        avatar: { type: String }
    },
    reason: { type: String, required: true },
    status: { type: String, default: "Open" },
    tags: { type: [String], default: [] },
    votes: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now },
    guildId: { type: String, required: true }  // New field for guild ID
});

// Ensure indexes for optimized lookups
ReportSchema.index({ reportId: 1 }, { unique: true });
ReportSchema.index({ reporterId: 1 });
ReportSchema.index({ reportedUserId: 1 });

module.exports = mongoose.model("Report", ReportSchema);