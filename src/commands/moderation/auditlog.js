const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const mongoose = require("mongoose");
const ModLog = mongoose.model("mod-logs");

module.exports = {
    name: "auditlog",
    description: "View all moderation actions taken on a user.",
    category: "MODERATION",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        aliases: ["al", "modlogs", "punishments"],
        usage: "[user] [case#]",
        minArgsCount: 0,
    },
    slashCommand: {
        enabled: true,
        ephemeral: false,
        options: [
            {
                name: "user",
                description: "The user to check mod actions for.",
                type: ApplicationCommandOptionType.User,
                required: false,
            },
            {
                name: "case",
                description: "Search for a specific case number.",
                type: ApplicationCommandOptionType.Integer,
                required: false,
            },
            {
                name: "action",
                description: "Filter by action type (Warn, Ban, Kick, etc.).",
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    { name: "Warn", value: "WARN" },
                    { name: "Ban", value: "BAN" },
                    { name: "Kick", value: "KICK" },
                    { name: "Timeout", value: "TIMEOUT" },
                    { name: "Unban", value: "UNBAN" },
                    { name: "Softban", value: "SOFTBAN" },
                    { name: "Mute", value: "VMUTE" },
                    { name: "Unmute", value: "VUNMUTE" },
                    { name: "Deafen", value: "DEAFEN" },
                    { name: "Undeafen", value: "UNDEAFEN" },
                    { name: "Disconnect", value: "DISCONNECT" },
                    { name: "Move", value: "MOVE" }
                ]
            },
        ],
    },

    async messageRun(message, args) {
        //const userId = args[0] && /^\d{17,19}$/.test(args[0]) ? args[0] : null;
        
        //const actionType = args.length > 1 && !userId && !caseNumber ? args[1].toUpperCase() : null;
        let userId = null;
        let actionType = null;
    
        // Check if there is a UserID/Mention
        if (args.length === 1) {
            actionType = args[0].toUpperCase(); // If only one argument, treat it as actionType
        }
    
        // If there are two arguments, treat the first as UserID/Mention and the second as actionType
        if (args.length > 1 || (args[0] && (message.mentions.users.size > 0 || /^\d{17,19}$/.test(args[0]))) ) {
            if (message.mentions.users.size > 0) {
                userId = message.mentions.users.first().id; // If mention is found
            } else if (args[0] && /^\d{17,19}$/.test(args[0])) {
                userId = args[0]; // If valid UserID is passed
            }
    
            // If a second argument exists, it's the actionType
            if (args.length > 1) {
                actionType = args[1].toUpperCase(); // Set actionType
            }
        }

        // If no user is provided and the user is a mod, set userId to null for all logs
        if (userId === null && message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            userId = null; // Mods can see all logs if no user is provided
        }

        const caseNumber = userId ? null : args.length > 0 ? parseInt(args[0]) : null;
        const targetUser = message.mentions.users.first() || 
                            (userId ? await message.client.users.fetch(userId).catch(() => null) : null) || 
                            message.author;
        console.log("Action type:", actionType);
        await this.fetchModLogs(message, targetUser, caseNumber, 1, message.author, actionType);
    },

    async interactionRun(interaction) {
        const targetUser = interaction.options.getUser("user") || interaction.user;
        const caseNumber = interaction.options.getInteger("case");
        const actionType = interaction.options.getString("action");

        // Parse action type
        const validActionTypes = [
            "PURGE", "WARN", "TIMEOUT", "UNTIMEOUT", "KICK", "SOFTBAN", 
            "BAN", "UNBAN", "VMUTE", "VUNMUTE", "DEAFEN", "UNDEAFEN", 
            "DISCONNECT", "MOVE"
        ];
        
        let parsedActionType = null;
        if (actionType && validActionTypes.includes(actionType.toUpperCase())) {
            parsedActionType = actionType.toUpperCase();
        }
        await this.fetchModLogs(interaction, targetUser, caseNumber, 1, interaction.user, actionType);
    },

    async fetchModLogs(context, user, caseNumber, page = 1, requester, actionType) {
        const isMod = context.member.permissions.has(PermissionFlagsBits.ManageMessages);
        const requesterId = requester?.id
        const isSelfRequest = user.id === requesterId;
    
        if (!isMod && !isSelfRequest) {
            if (context.deferred || context.replied) {
                return context.editReply("<:No:1330253494447243355> You can only view your own mod log.");
            } else {
                return context.reply("<:No:1330253494447243355> You can only view your own mod log.");
            }
        }

        // Fix the query construction logic
        let query = { guild_id: context.guild.id };

        if (caseNumber) {
            query.case_number = caseNumber; // Filter by case number
        } else {
            //query.member_id = user.id; // Apply member_id filter only when not searching by case number
            if (!isMod) {
                if (user.id !== requesterId && isMod) {
                    query.member_id = user.id; //Mods can see all logs for other users
                }
            //} else {
                //query.member_id = user.id; //Normal Users can only view their own logs
            }
        }

        if (actionType) {
            query.type = actionType.toUpperCase();
        }
        
        console.log("Fetching mod logs with query:", query);
    
        const logs = await ModLog.find(query).sort({ created_at: -1 });

        //console.log("Fetched logs:", logs);
    
        if (!logs.length) {
            if (context.deferred || context.replied) {
                return context.editReply(`<:Yes:1330253737687781436> No moderation actions found for **${user.tag}**.`);
            } else {
                return context.reply(`<:Yes:1330253737687781436> No moderation actions found for **${user.tag}**.`);
            }
        }
    
        const logsPerPage = 5;
        const totalPages = caseNumber ? 1 : Math.ceil(logs.length / logsPerPage);
        const currentPage = Math.min(Math.max(page, 1), totalPages);
        const start = (currentPage - 1) * logsPerPage;
        const selectedLogs = caseNumber ? logs : logs.slice(start, start + logsPerPage);
    
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Moderation Log for: ${user.username}`, iconURL: user.displayAvatarURL() })
            .setColor(0xff0000)
            .setFooter({ text: caseNumber ? `Showing Case #${caseNumber}` : `Page ${currentPage} of ${totalPages}` });
    
        selectedLogs.forEach((log) => {
            embed.addFields({
                name: `Case #${log.case_number} - ${log.type}`,
                value: `**Moderator:** <@${log.admin.id}> (${log.admin.id})\n**Reason:** ${log.reason || "No reason provided"}\n**Date:** <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:F>`,
            });
        });
    
        // Pagination buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`modlog_prev_${user.id}_${caseNumber || "ALL"}_${currentPage}`)
                .setLabel("◀️ Previous")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 1),
            new ButtonBuilder()
                .setCustomId(`modlog_next_${user.id}_${caseNumber || "ALL"}_${currentPage}`)
                .setLabel("Next ▶️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages)
        );
    
        let response;
        if (context.deferred || context.replied) {
            response = await context.editReply({ embeds: [embed], components: totalPages > 1 ? [row] : [], fetchReply: true });
        } else {
            response = await context.reply({ embeds: [embed], components: totalPages > 1 ? [row] : [], fetchReply: true });
        }
         // Handle pagination
        if (totalPages > 1 && !caseNumber) this.handlePagination(response, context, user, caseNumber, currentPage, totalPages, requester, actionType);
    },

    async handlePagination(message, context, user, caseNumber, currentPage, totalPages, requester, actionType) {
        const collector = message.createMessageComponentCollector({ time: 60000 });
    
        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== requester.id) {
                return interaction.editReply({ content: "<:No:1330253494447243355> You cannot control this pagination.", ephemeral: true });
            }
    
            // Extract information from the button custom ID
            const parts = interaction.customId.split("_");
            const action = parts[1]; // "prev" or "next"
            const userId = parts[2]; // User ID
            const filterValue = parts[3] !== "ALL" ? parseInt(parts[3]) : null; // Case number or null
            let newPage = parseInt(parts[4]); // Extracted page number
    
            if (userId !== user.id || (caseNumber && filterValue !== caseNumber)) return; // Ensure correct user and case search
    
            // Adjust the page number
            if (action === "prev" && newPage > 1) newPage--;
            if (action === "next" && newPage < totalPages) newPage++;
    
            // Fetch updated logs
            const logsPerPage = 5;
            const query = { guild_id: context.guild.id };

            if (caseNumber) query.case_number = caseNumber;
            if (actionType) query.type = actionType.toUpperCase();

            // If no specific user is being filtered, just fetch logs for the guild
            /*if (userId !== "ALL") {
                console.log("UserID", userId);
                query.member_id = user.id; // Apply member_id filter only for specific users
            }*/

            console.log("Query:", query);

            const logs = await ModLog.find(query).sort({ created_at: -1 });

            // Calculate total pages after filtering logs
            const totalLogs = logs.length;
            totalPages = Math.ceil(totalLogs / logsPerPage);

            console.log(`Total Logs: ${totalLogs}, Total Pages: ${totalPages}`);
    
            const start = (newPage - 1) * logsPerPage;
            const selectedLogs = logs.slice(start, start + logsPerPage);

            // If no logs are found on the current page, ensure we're not showing a blank page
            if (selectedLogs.length === 0) {
                // If we're on the last page, we shouldn't go further
                if (newPage > 1) newPage--;
                return interaction.update({ content: "No more logs to display.", components: [] });
            }
    
            // Create new embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Moderation Log for: ${user.username}`, iconURL: user.displayAvatarURL() })
                .setColor(0xff0000)
                .setFooter({ text: `Page ${newPage} of ${totalPages}` });
    
            selectedLogs.forEach((log) => {
                embed.addFields({
                    name: `Case #${log.case_number} - ${log.type}`,
                    value: `**Moderator:** <@${log.admin.id}> (${log.admin.id})\n**Reason:** ${log.reason || "No reason provided"}\n**Date:** <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:F>`,
                });
            });
    
            // Updated pagination buttons with the correct page number
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`modlog_prev_${user.id}_${caseNumber || "ALL"}_${newPage}`)
                    .setLabel("◀️ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(newPage === 1),
                new ButtonBuilder()
                    .setCustomId(`modlog_next_${user.id}_${caseNumber || "ALL"}_${newPage}`)
                    .setLabel("Next ▶️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(newPage === totalPages)
            );
    
            // Update the existing message
            await interaction.update({ embeds: [embed], components: [row] });
        });
    
        collector.on("end", async () => {
            await message.edit({ components: [] }).catch(() => {});
        });
    }
};