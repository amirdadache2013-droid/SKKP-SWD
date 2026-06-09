import { loadCommands } from "./src/handlers/commandHandler.js";

client.on("ready", () => {
  loadCommands(client);
  console.log("SWD BOT ONLINE 🚒");
});
client.commands = new Map();
