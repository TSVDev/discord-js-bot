const { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const Report = require("@schemas/Report");

module.exports = {
    name: "reportlogs",
    description: "Look up a report by ID, reporter, or reported user",
    category: "MODERATION",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        aliases: ["rs", "rl", "reportsearch", "reportlookup"],
        usage: "[reportID|@reporter|@reported] [delete]",
        minArgsCount: 0,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "query",
                description: "Report ID, Reporter, or Reported User",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "start_date",
                description: "Start date (YYYY-MM-DD)",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "end_date",
                description: "End date (YYYY-MM-DD)",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "status",
                description: "Filter by report status",
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    { name: "Open", value: "Open" },
                    { name: "In Review", value: "In Review" },
                    { name: "Resolved", value: "Resolved" },
                ],
            },
            {
                name: "action",
                description: "Action to perform, such as 'delete'",
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    { name: "delete", value: "delete" },
                ],
            },
        ],
    },

    async messageRun(message, args) {
        const query = args[0] || null; // Get the first argument (reportID, reporter, or reported user)
        const startDate = args[1] || null;
        const endDate = args[2] || null;
        const status = args[3] || null;
        const action = args[1] || null; // Get the second argument (delete)
        await this.handleLookup(message, query, startDate, endDate, status, message.channel, message.author, false, action);
    },

    async interactionRun(interaction) {
        const query = interaction.options.getString("query") || null; // Get the query from slash command
        const startDate = interaction.options.getString("start_date") || null;
        const endDate = interaction.options.getString("end_date") || null;
        const status = interaction.options.getString("status") || null;
        const action = interaction.options.getString("action") || null; // Get the action from slash command
        await this.handleLookup(interaction, query, startDate, endDate, status, interaction.channel, interaction.user, true, action);
    },

    async handleLookup(context, query, startDate, endDate, status, channel, requester, isInteraction, action) {
        let reports = [];
        const guildId = context.guild.id; // Get the guildId (to make it guild-specific)
        const isMod = context.member.permissions.has(PermissionFlagsBits.ManageMessages);

        // If no query is provided, default to showing the requester's own reports
        if (!query) {
            reports = await Report.find({ reporterId: requester.id, guildId });
        } else {

            // Check if the query is a mention
            const mentionMatch = query.match(/^<@!?(\d+)>$/);
            const userId = mentionMatch ? mentionMatch[1] : query; // Extract user ID from mention or use query as ID
            let reportId = parseInt(query, 10);


            if (!isMod) {
                // Non-mod users can only search their own reports
                reports = await Report.find({
                    reporterId: requester.id,
                    guildId,
                    $or: [
                        { reportedUserId: query }, // Reported user ID search
                        { reportId: !isNaN(reportId) ? reportId : undefined }, // Report ID search
                        { reason: new RegExp(query, "i") }, // Reason search
                        { status: new RegExp(`^${query}$`, "i") } // Status search
                    ].filter(Boolean), // Remove undefined values
                });


            } else { 
                // Moderators can search everything
                 reports = await Report.find({
                    guildId,
                    $or: [
                        { reportId: !isNaN(reportId) ? reportId : undefined }, // Report ID
                        { reporterId: userId }, // Reporter ID
                        { reportedUserId: userId }, // Reported user ID
                        { reason: new RegExp(query, "i") }, // Reason
                        { status: new RegExp(`^${query}$`, "i") } // Status search
                    ].filter(Boolean), // Remove undefined values
                });
            }
        }

        if (startDate && endDate) {
            reports = reports.filter(report => {
                const reportDate = new Date(report.timestamp);
                return reportDate >= new Date(startDate) && reportDate <= new Date(endDate);
            });
        }


         // If delete action is specified, delete the report
        if (isMod && action === "delete" && reports && reports.length > 0) {
            let reportId = parseInt(query, 10); // Get the report ID from the query

            if (isNaN(reportId)) return this.sendReply(context, isInteraction, "<:No:1330253494447243355> Invalid Report ID for deletion.");

            const reportToDelete = await Report.findOneAndDelete({ reportId, guildId });
            if (!reportToDelete) return this.sendReply(context, isInteraction, "<:No:1330253494447243355> Report not found or unable to delete.");
            return this.sendReply(context, isInteraction, `<:Yes:1330253737687781436> Report ID ${reportId} has been deleted.`);
        }

        if (!reports?.length) {
            return this.sendReply(context, isInteraction, "<:No:1330253494447243355> No reports found matching the query.");
        }

        this.paginateReports(context, reports, isInteraction, requester);
    },

    sendReply(context, isInteraction, message) {
        return isInteraction
            ? context.editReply({ content: message })
            : context.channel.send(message);
    },

    async paginateReports(context, reports, isInteraction, requester, currentIndex = 0) {
        const itemsPerPage = 5;
        const totalPages = Math.ceil(reports.length / itemsPerPage);

        const generateEmbed = (index) => {
            const start = index * itemsPerPage;
            const end = start + itemsPerPage;
            const currentReports = reports.slice(start, end);

            // Always ensure description is set
            let description = currentReports.length > 0 
                ? currentReports.map((r) => 
                    `**Report ID:** ${r.reportId}\n**Reported User:** <@${r.reportedUserId}>\n**Reporter:** <@${r.reporterId}>\n**Reason:** ${r.reason}\n**Status:** ${r.status}\n**Created At:** ${new Date(r.timestamp).toLocaleString()}`
                 ).join("\n\n") 
                : "*No reports available on this page.*"; // Ensure a fallback message

            const embed = new EmbedBuilder()
                .setTitle("Report Logs")
                .setColor("#00BFFF")
                .setFooter({ text: `Page ${index + 1} of ${totalPages}` })
                .setDescription(description); // Always set description

            return embed;
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅️ Previous")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentIndex === 0),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("➡️ Next")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentIndex === totalPages - 1)
        );

        const messageOptions = { embeds: [generateEmbed(currentIndex)], components: totalPages > 1 ? [row] : [] };

        if (isInteraction) {
            const response = await context.editReply(messageOptions);
            if (totalPages > 1) this.handlePagination(response, context, reports, currentIndex, totalPages, isInteraction, requester);
        } else {
            const response = await context.channel.send(messageOptions);
            if (totalPages > 1) this.handlePagination(response, context, reports, currentIndex, totalPages, isInteraction, requester);
        }
    },

    async handlePagination(message, context, reports, currentIndex, totalPages, isInteraction, requester) {

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== requester.id) {
                return interaction.reply({ content: "<:No:1330253494447243355> You cannot control this pagination.", ephemeral: true });
            }

            if (interaction.customId === "prev" && currentIndex > 0) currentIndex--;
            if (interaction.customId === "next" && currentIndex < totalPages - 1) currentIndex++;

            //const embed = this.paginateReports(context, reports, isInteraction, currentIndex, requester);
             // Generate the embed properly
            const embed = new EmbedBuilder()
                .setTitle("Report Logs")
                .setColor("#00BFFF")
                .setFooter({ text: `Page ${currentIndex + 1} of ${totalPages}` });

            // Ensure description is never empty
            const start = currentIndex * 1;
            const report = reports[start];

            if (report) {
                embed.setDescription(
            `**Report ID:** ${report.reportId}\n**Reported User:** <@${report.reportedUserId}>\n**Reporter:** <@${report.reporterId}>\n**Reason:** ${report.reason}\n**Status:** ${report.status}\n**Created At:** ${new Date(report.timestamp).toLocaleString()}`
                );
            } else {
             embed.setDescription("*No reports available on this page.*"); // Fallback description
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentIndex === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("➡️ Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentIndex === totalPages - 1)
            );

            await interaction.update({ embeds: [embed], components: [row] });
        });

        collector.on("end", async () => {
            await message.edit({ components: [] }).catch(() => {});
        });
    }
};