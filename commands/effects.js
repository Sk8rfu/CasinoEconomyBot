import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { hasEffect } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('effects')
.setDescription('Показва активните ти ефекти');

export async function execute(interaction) {
    const userId = interaction.user.id;

    const rows = db.prepare(`
    SELECT effect_id, expires_at
    FROM active_effects
    WHERE user_id = ?
    `).all(userId);

    if (rows.length === 0)
        return interaction.reply("✨ Нямаш активни ефекти.");

    const now = Math.floor(Date.now() / 1000);
    let effectsList = "";

    for (const row of rows) {
        const { effect_id, expires_at } = row;

        if (!hasEffect(userId, effect_id)) continue;

        const remaining = expires_at - now;

        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;

        let timeStr = "";
        if (hours > 0) timeStr = `${hours}ч ${minutes}м`;
        else if (minutes > 0) timeStr = `${minutes}м ${seconds}с`;
        else timeStr = `${seconds}с`;

        effectsList += `• **${effect_id}** — остава **${timeStr}**\n`;
    }

    const embed = new EmbedBuilder()
    .setColor('#8A2BE2')
    .setTitle('🧪 Активни ефекти')
    .setDescription(effectsList)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: 'CasinoEconomyBot' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
