import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';

export const data = new SlashCommandBuilder()
.setName('jackpot')
.setDescription('Показва текущия Jackpot и участниците');

export async function execute(interaction) {

    // Взимаме всички потребители с tickets > 0
    const participants = db.prepare(`
    SELECT id, jackpotTickets
    FROM users
    WHERE jackpotTickets > 0
    `).all();

    if (participants.length === 0) {
        return interaction.reply({
            content: "🎟️ Няма участници в Jackpot-а.",
            flags: 64
        });
    }

    let totalTickets = participants.reduce((sum, u) => sum + u.jackpotTickets, 0);

    let desc = "";
    for (const p of participants) {
        const chance = ((p.jackpotTickets / totalTickets) * 100).toFixed(2);
        desc += `👤 <@${p.id}> — ${p.jackpotTickets} tickets (**${chance}% шанс**)\n`;
    }

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🏆 Jackpot — Участници')
    .setDescription(desc)
    .addFields(
        { name: "🎟 Общо tickets", value: `${totalTickets}`, inline: true },
        { name: "🎁 Награди", value: "50 000 лв\n100 000 лв\n250 000 лв\n500 000 лв\nDiamond Token\nAncient Artifact\nSIN R1\nBlackjack Boost\nDuel Boost" }
    )
    .setFooter({ text: "CasinoEconomyBot — Jackpot" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
