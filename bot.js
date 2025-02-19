require("dotenv").config();
require("module-alias/register");

// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { checkForUpdates } = require("@helpers/BotUtils");
const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

const { startReminderHandler } = require("@handlers/reminderHandler");

// Add Express for HTTP monitoring
const express = require("express");
const app = express();
const port = 3000; // The port for the status check

// A simple status endpoint to check if the bot is running
app.get("/status", (req, res) => {
  res.status(200).send("Bot is running!");
});

// Start the status server
app.listen(port, () => {
  console.log(`Status server running at http://localhost:${port}/status`);
});

validateConfiguration();

// initialize client
const client = new BotClient();
global.client = client; // for easier access in other files
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

// find unhandled promise rejections
process.on("unhandledRejection", (err) => client.logger.error(`Unhandled exception`, err));

(async () => {
  
  // Check for updates (optional)
  await checkForUpdates();

  // Start the dashboard (optional)
  if (client.config.DASHBOARD.enabled) {
    client.logger.log("Launching dashboard");
    try {
      const { launch } = require("@root/dashboard/app");

      // Let the dashboard initialize the database
      await launch(client);
    } catch (ex) {
      client.logger.error("Failed to launch dashboard", ex);
    }
  } else {
    // Initialize the database if no dashboard
    await initializeMongoose();
  }

  startReminderHandler(client);

  // Start the client
  await client.login(process.env.BOT_TOKEN);
})();