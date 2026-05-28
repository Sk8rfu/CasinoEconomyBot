import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('balance')
.setDescription('Показва твоя баланс');

export async function execute(interaction) {
    const user = getUser(interaction.user.id);

    const embed = new EmbedBuilder()
    .setColor('#00FF7F')
    .setTitle('💰 Твоят баланс')
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
        { name: '🪙 Портфейл', value: `${user.balance} лв`, inline: true },
        { name: '🏦 Банка', value: `${user.bank} лв`, inline: true },
        { name: '📏 Лимит', value: `${user.bank_limit} лв`, inline: true },
        { name: '💳 Кредит', value: `${user.loan} лв`, inline: true },
        { name: '👑 VIP Ниво', value: `${user.vip_level}`, inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
