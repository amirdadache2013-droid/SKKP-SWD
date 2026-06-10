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
    console.log('🚓 SWD START...');

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
      console.log('🌐 Web OK');
    });
  }

  loadCommands() {
    // na start testowo 1 komenda
    this.commands.set('nick', {
      data: {
        name: 'nick',
        description: 'Zmienia nick funkcjonariusza',
        toJSON() {
          return this;
        }
      },
      async execute(interaction) {
        await interaction.reply('🚓 Nick system działa!');
      }
    });
  }

  async registerCommands() {
    const guild = await this.guilds.fetch(process.env.GUILD_ID);

    const commands = [...this.commands.values()].map(c => c.data);

    await guild.commands.set(commands);

    console.log('📡 Slash commands zarejestrowane');
  }
}

const bot = new SWDBot();

bot.start();
