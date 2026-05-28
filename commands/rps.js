import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('rps')
.setDescription('Камък, ножица, хартия')
.addStringOption(opt =>
opt.setName('избор')
.setDescription('rock, paper, scissors')
.setRequired(true)
);

export async function execute(interaction) {
    const choice = interaction.options.getString('избор').toLowerCase();
    const options = ["rock", "paper", "scissors"];

    if (!options.includes(choice)) {
        return interaction.reply("❌ Избери rock, paper или scissors.");
    }

    const bot = options[Math.floor(Math.random() * 3)];

    const win =
    (choice === "rock" && bot === "scissors") ||
    (choice === "paper" && bot === "rock") ||
    (choice === "scissors" && bot === "paper");

    const lose =
    (choice === "rock" && bot === "paper") ||
    (choice === "paper" && bot === "scissors") ||
    (choice === "scissors" && bot === "rock");

    const result = win ? "🎉 Победи!" : lose ? "💀 Загуби." : "🤝 Равенство.";

    const embed = new EmbedBuilder()
    .setColor('#1E90FF')
    .setTitle('✊📄✂️ Камък, Ножица, Хартия')
    .addFields(
        { name: 'Твоят избор', value: choice, inline: true },
        { name: 'Избор на бота', value: bot, inline: true },
        { name: 'Резултат', value: result }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — RPS' });

    return interaction.reply({ embeds: [embed] });
}
