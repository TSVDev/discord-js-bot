const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
//const ModLog = require("@schemas/ModLog");
const mongoose = require("mongoose");
const ModLog = mongoose.model("mod-logs");

module.exports = {
    name: "reason",
    description: "Update the reason for a mod action",
    category: "MODERATION",
    userPermissions: ["ManageGuild"],
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        aliases: ["updatereason", "editreason"],
        usage: "<case_number> <new reason>",
        minArgsCount: 2,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "case_number",
                description: "The case number of the mod action to update",
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
            {
                name: "new_reason",
                description: "The new reason for the mod action",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("<:No:1330253494447243355> You do not have permission to use this command.");
        }
        
        const caseNumber = parseInt(args[0], 10);
        if (isNaN(caseNumber)) {
            return message.reply("<:No:1330253494447243355> Invalid case number.");
        }
        
        const newReason = args.slice(1).join(" ");
        await this.updateReason(message, caseNumber, newReason);
    },

    async interactionRun(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.editReply({ content: "<:No:1330253494447243355> You do not have permission to use this command.", ephemeral: true });
        }
        
        const caseNumber = interaction.options.getInteger("case_number");
        const newReason = interaction.options.getString("new_reason");
        await this.updateReason(interaction, caseNumber, newReason);
    },

    async updateReason(context, caseNumber, newReason) {
        const modAction = await ModLog.findOne({ case_number: caseNumber });
        if (!modAction) {
            return context.editReply("<:No:1330253494447243355> Mod action not found.");
        }
        
        modAction.reason = newReason;
        await modAction.save();
        
        return context.editreply(`<:Yes:1330253737687781436> Successfully updated the reason for mod action **#${caseNumber}**.`);
    }
};
