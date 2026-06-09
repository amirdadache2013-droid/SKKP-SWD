import fs from "fs";
import path from "path";

export function loadCommands(client) {
  const commandsPath = path.resolve("./commands/swd");

  const commandFiles = fs.readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(filePath)).default;

    if (!command?.name || !command?.execute) continue;

    client.commands.set(command.name, command);
  }

  console.log(`🚒 SWD: załadowano ${commandFiles.length} komend`);
}
