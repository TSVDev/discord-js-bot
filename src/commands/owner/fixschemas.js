const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const mongoose = require("mongoose");
const ModLog = mongoose.model("mod-logs");


module.exports = {
    name: "fixschemas",
    description: "Adds missing entries to old schemas.",
    category: "OWNER",
    command: {
        enabled: false,
        aliases: ["updatedb"],
    },
    slashCommand: {
        enabled: false,
        ephemeral: true,
    },

    async messageRun(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("<:No:1330253494447243355> You do not have permission to use this command.");
        }
        await this.fixModLogs(message);
    },

    async interactionRun(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.editReply({ content: "<:No:1330253494447243355> You do not have permission to use this command.", ephemeral: true });
        }
        await this.fixModLogs(interaction);
    },

    async fixModLogs(context) {
        try {
            const missingLogsCount = await ModLog.countDocuments({ updatedAt: { $exists: false } });

            if (missingLogsCount === 0) {
                return context.editReply("<:Yes:1330253737687781436> All mod logs are already up to date.");
            }

            await context.editReply(`<:Yes:1330253737687781436> Found **${missingLogsCount}** mod logs missing updatedAt. Processing in batches of 500...`);

            const batchSize = 500;
            let updatedCount = 0;

            while (updatedCount < missingLogsCount) {
                const updated = await ModLog.updateMany(
                    { updatedAt: { $exists: false } },
                    { $set: { updatedAt: new Date() } },
                    { limit: batchSize }
                );

                updatedCount += updated.modifiedCount;

                // Send progress update every 2000 logs processed
                if (updatedCount % 2000 === 0 || updatedCount >= missingLogsCount) {
                    await context.channel.send(`<:Yes:1330253737687781436> Progress: **${updatedCount}/${missingLogsCount}** mod logs updated.`);
                }
            }

            return context.channel.send(`<:Yes:1330253737687781436> Successfully updated **${updatedCount}** mod logs.`);
        } catch (error) {
            console.error("Error updating mod logs:", error);
            return context.editReply("<:No:1330253494447243355> An error occurred while updating mod logs.");
        }
    }
};
