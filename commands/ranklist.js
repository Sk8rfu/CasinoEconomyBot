import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';

function getRank(balance) {
    if (balance >= 1000000) return "Легенда на богатството";
    if (balance >= 500000) return "Мултимилионер";
    if (balance >= 100000) return "Богаташ";
    if (balance >= 50000) return "Милионер в процес";
    if (balance >= 10000) return "Бизнесмен";
    if (balance >= 1000) return "Работник";
    return "Новобранец";
}

export const data = new SlashCommandBuilder()
.setName('ranklist')
.setDescription('Показва класация по рангове');

export async function execute(interaction) {
    const rows = db.prepare(`SELECT id, balance FROM users`).all();

    if (rows.length === 0) {
        return interaction.reply("❌ Няма данни за класация.");
    }

    rows.sort((a, b) => b.balance - a.balance);

    let desc = "";

    for (let i = 0; i < Math.min(rows.length, 20); i++) {
        const user = await interaction.client.users.fetch(rows[i].id).catch(() => null);
        const name = user ? user.username : "Unknown User";
        const rank = getRank(rows[i].balance);

        desc += `**${i + 1}. ${name}** — ${rank} (${rows[i].balance} лв)\n`;
    }

    const embed = new EmbedBuilder()
    .setColor('#4B0082')
    .setTitle('📈 Класация по рангове')
    .setDescription(desc)
    .setFooter({ text: 'CasinoEconomyBot — Ранг Система' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
