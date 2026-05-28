import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vipdaily')
.setDescription('Вземи своята дневна VIP награда');

export async function execute(interaction) {
    const id = interaction.user.id;
    const user = getUser(id);

    if (user.vip_level <= 0) {
        return interaction.reply({
            content: "❌ Нямаш VIP ниво. Използвай /vip за повече информация.",
            flags: 64
        });
    }

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 часа

    if (user.vipdaily_last && now - user.vipdaily_last < cooldown) {
        const remaining = cooldown - (now - user.vipdaily_last);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return interaction.reply({
            content: `⏳ Можеш да вземеш следващата VIP награда след **${hours}ч ${minutes}м**.`,
            flags: 64
        });
    }

    // Награда според VIP нивото
    const rewards = {
        1: 500,
        2: 1000,
        3: 2000,
        4: 3500,
        5: 5000
    };

    const reward = rewards[user.vip_level] || 500;

    updateBalance(id, reward);
    user.vipdaily_last = now;

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 VIP Дневна Награда')
    .setDescription(`Получаваш **${reward} лв** за твоето VIP ниво!`)
    .addFields(
        { name: 'VIP Ниво', value: `${user.vip_level}`, inline: true },
        { name: 'Награда', value: `${reward} лв`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — VIP Daily' });

    return interaction.reply({ embeds: [embed] });
}
