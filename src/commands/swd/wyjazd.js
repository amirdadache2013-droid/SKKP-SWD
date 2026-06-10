import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('wyjazd')
    .setDescription('Zgłoszenie wyjazdu jednostki SWD'),

  async execute(interaction) {
    await interaction.reply('🚨 Jednostka została zadysponowana (SWD RP)');
  }
};
