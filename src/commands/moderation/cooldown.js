module.exports = {
    name: "cooldown",
    description: "Set cooldown for the channel.",
    cooldown: 0,
    category: "MODERATION",
    botPermissions: ["ManageChannels"],
    userPermissions: ["ManageChannels"],
    command: {
        enabled: true,
        aliases: ["slowmode","slow","cool","cd","sm"], // you can add aliases here 
        usage: "[(e.g., 1s, 5m, 1h,) | remove]",
        minArgsCount: 1,
    },
    async messageRun(message, args, data) {
        if (args[0].toLowerCase() === "remove") {
            message.channel.setRateLimitPerUser(0)
                .then(() => {
                    message.channel.send("<:yes:1235503385323769877> Cooldown has been removed.");
                })
                .catch(error => {
                    console.error("Error removing cooldown:", error);
                    message.channel.send("<:no:1235502897215836160> An error occurred while removing the cooldown.");
                });
            return;
        }
        const cooldownTime = args[0].toLowerCase();
        const regex = /(\d+)([smhd])/;
        if (!regex.test(cooldownTime)) {
            return message.channel.send("<:info:1249145380973838478> Please provide a valid cooldown time (e.g., 1s, 5m, 1h, 1d).");
        }
        const [, time, unit] = cooldownTime.match(regex);
        let duration = 0;
        switch (unit) {
            case "s" || "second" || "sec":
                duration = time * 1000;
                break;
            case "m" || "minute":
                duration = time * 60 * 1000;
                break;
            case "h" || "hour":
                duration = time * 60 * 60 * 1000;
                break;
        }
        message.channel.setRateLimitPerUser(duration / 1000)
            .then(() => {
                message.channel.send(`<:yes:1235503385323769877> Cooldown set to ${time}${unit}.`);
            })
            .catch(error => {
                message.channel.send("<:no:1235502897215836160> An error occurred while setting the cooldown.");
            });
            
    },
};