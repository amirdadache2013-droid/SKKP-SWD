import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import express from 'express';

class SWDBot extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.commands = new Collection();
  }

  async start() {
    console.log('🚓 SWD SYSTEM START...');

    this.startWeb();
    this.loadCommands();

    await this.login(process.env.DISCORD_TOKEN);

    await this.registerCommands();

    console.log('✅ SWD ONLINE');
  }

  startWeb() {
    const app = express();

    app.get('/health', (req, res) => {
      res.json({ status: 'SWD ONLINE' });
    });

    app.listen(3000, () => {
      console.log('🌐 WEB OK');
    });
  }

  loadCommands() {
    // 🔥 TU MASZ SYSTEM SWD (bez nick)
    this.commands.set('wyjazd', {
      data: {
        name: 'wyjazd',
        description: 'Zgłoszenie wyjazdu jednostki',
        toJSON() {
          return this;
        }
      },

      async execute(interaction) {
        await interaction.reply('🚨 Jednostka została zadysponowana!');
      }
    });
  }

  async registerCommands() {
    const guild = await this.guilds.fetch(process.env.GUILD_ID);

    const commands = [...this.commands.values()].map(cmd =>
      cmd.data
    );

    await guild.commands.set(commands);

    console.log('📡 Slash commands registered');
  }
}

const bot = new SWDBot();

bot.start();
