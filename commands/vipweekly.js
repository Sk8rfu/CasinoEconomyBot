import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vipweekly')
.setDescription('Вземи своята седмична VIP награда');

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
    const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 дни

    if (user.vipweekly_last && now - user.vipweekly_last < cooldown) {
        const remaining = cooldown - (now - user.vipweekly_last);
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return interaction.reply({
            content: `⏳ Можеш да вземеш следващата VIP седмична награда след **${days} дни и ${hours} часа**.`,
            flags: 64
        });
    }

    const rewards = {
        1: 5000,
        2: 10000,
        3: 15000,
        4: 20000,
        5: 25000
    };

    const reward = rewards[user.vip_level] || 5000;

    updateBalance(id, reward);
    user.vipweekly_last = now;

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 VIP Седмична Награда')
    .setDescription(`Получаваш **${reward} лв** за твоето VIP ниво!`)
    .addFields(
        { name: 'VIP Ниво', value: `${user.vip_level}`, inline: true },
        { name: 'Награда', value: `${reward} лв`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — VIP Weekly' });

    return interaction.reply({ embeds: [embed] });
}
