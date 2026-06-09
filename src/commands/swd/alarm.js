export default {
  name: "alarm",
  description: "SWD Alarm",

  async execute(interaction) {
    await interaction.reply("🚨 SWD: ALARM ZADYSPOZYCJONOWANY");
  }
};
