import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { REST } from '@discordjs/rest';
import express from 'express';
import cron from 'node-cron';

import config from './config/application.js';
import { initializeDatabase } from './utils/database.js';
import { logger, startupLog, shutdownLog } from './utils/logger.js';
import { checkBirthdays } from './services/birthdayService.js';
import { checkGiveaways } from './services/giveawayService.js';
import { loadCommands, registerCommands } from './handlers/commandLoader.js';

class TitanBot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans,
      ],
    });

    this.config = config;
    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.db = null;

    this.rest = new REST({ version: '10' }).setToken(config.bot.token);
  }

  async start() {
    try {
      startupLog('Starting SWD Bot...');

      await initializeDatabase();

      this.startWebServer();

      startupLog('Loading SWD commands...');
      await loadCommands(this);

      startupLog(`Loaded SWD commands: ${this.commands.size}`);

      startupLog('Logging into Discord...');
      await this.login(this.config.bot.token);

      startupLog('Registering SWD slash commands...');
      await this.();

      startupLog('Bot is ONLINE ✅');

      this.setupCronJobs();

    } catch (err) {
      logger.error(err);
      process.exit(1);
    }
  }

  startWebServer() {
    const app = express();

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', bot: 'SWD ONLINE' });
    });

    app.listen(process.env.PORT || 3000, () => {
      startupLog('Web server running');
    });
  }

  setupCronJobs() {
    cron.schedule('0 6 * * *', () => checkBirthdays(this));
    cron.schedule('* * * * *', () => checkGiveaways(this));
  }

  // 🔥 NAJWAŻNIEJSZA CZĘŚĆ (POPRAWIONA)
 async registerCommands() {
  try {
    await registerSlashCommands(this, this.config.bot.guildId);
    logger.info("Slash commands registered successfully");
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
}

      // 🔥 2. ZBUDUJ SWD KOMENDY
      const commands = Array.from(this.commands.values()).map(cmd =>
        cmd.data.toJSON()
      );

      // 🔥 3. ZAREJESTRUJ NOWE
      await guild.commands.set(commands);

      startupLog(`SWD commands registered: ${commands.length}`);

    } catch (err) {
      logger.error('Command registration error:', err);
    }
  }

  async shutdown(reason = 'unknown') {
    shutdownLog(`Stopping bot: ${reason}`);
    this.destroy();
    process.exit(0);
  }
}

// START
const bot = new TitanBot();

process.on('SIGINT', () => bot.shutdown('SIGINT'));
process.on('SIGTERM', () => bot.shutdown('SIGTERM'));

bot.start();
