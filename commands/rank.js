import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('rank')
.setDescription('Показва ранга ти според парите');

export async function execute(interaction) {
    const user = getUser(interaction.user.id);

    let rank = "Новобранец";

    if (user.balance >= 1000) rank = "Работник";
    if (user.balance >= 10000) rank = "Бизнесмен";
    if (user.balance >= 50000) rank = "Милионер в процес";
    if (user.balance >= 100000) rank = "Богаташ";
    if (user.balance >= 500000) rank = "Мултимилионер";
    if (user.balance >= 1000000) rank = "Легенда на богатството";

    const embed = new EmbedBuilder()
    .setColor('#32CD32')
    .setTitle('📈 Твоят ранг')
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
        { name: 'Ранг', value: rank, inline: true },
        { name: 'Баланс', value: `${user.balance} лв`, inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot — Ранг Система' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
