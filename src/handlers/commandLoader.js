import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Collection } from 'discord.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 TYLKO SWD KOMENDY
const ALLOWED_FOLDER = 'swd';

async function getAllFiles(directory, fileList = []) {
    const files = await fs.readdir(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (file.isDirectory()) {
            await getAllFiles(filePath, fileList);
        } else if (file.name.endsWith('.js')) {
            fileList.push(filePath);
        }
    }

    return fileList;
}

export async function loadCommands(client) {
    client.commands = new Collection();

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = await getAllFiles(commandsPath);

    logger.info(`Found ${commandFiles.length} command files`);

    for (const filePath of commandFiles) {
        try {
            const normalized = filePath.replace(/\\/g, '/');

            const commandDir = path.basename(path.dirname(filePath));

            // ❌ BLOKADA INNYCH KOMEND
            if (commandDir !== ALLOWED_FOLDER) {
                logger.info(`Skipping non-SWD command: ${normalized}`);
                continue;
            }

            const commandModule = await import(`file://${filePath}`);
            const command = commandModule.default || commandModule;

            if (!command?.data || !command?.execute) {
                logger.warn(`Invalid command: ${normalized}`);
                continue;
            }

            const name = command.data.name;

            client.commands.set(name, command);

            logger.info(`Loaded SWD command: /${name}`);

        } catch (err) {
            logger.error(`Error loading command ${filePath}:`, err);
        }
    }

    logger.info(`SWD commands loaded: ${client.commands.size}`);
    return client.commands;
}

export async function registerCommands(client, guildId) {
    try {
        const commands = [];

        for (const command of client.commands.values()) {
            commands.push(command.data.toJSON());
        }

        if (!guildId) {
            logger.warn('No guildId provided - skipping registration');
            return;
        }

        const guild = await client.guilds.fetch(guildId);

        // 🔥 FULL RESET + RELOAD
        await guild.commands.set(commands);

        logger.info(`SWD commands registered: ${commands.length}`);

    } catch (error) {
        logger.error('Command registration error:', error);
    }
}

