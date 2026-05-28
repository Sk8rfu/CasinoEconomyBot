import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vip')
.setDescription('Показва твоето VIP ниво и бонуси');

export async function execute(interaction) {
    const user = getUser(interaction.user.id);

    // Гарантираме, че нивото не надвишава 5
    const level = Math.min(user.vip_level, 5);

    const bonuses = {
        0: "Няма бонуси",
        1: "+20% награди, +10% work",
        2: "+40% награди, +20% work",
        3: "+60% награди, +30% work",
        4: "+80% награди, +40% work",
        5: "+100% награди, +50% work"
    };

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 Твоето VIP ниво')
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
        { name: 'Ниво', value: `${level}`, inline: true },
        { name: 'Бонуси', value: bonuses[level], inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot — VIP Система' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
