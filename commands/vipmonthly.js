import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('vipmonthly')
.setDescription('Вземи своята месечна VIP награда');

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
    const cooldown = 30 * 24 * 60 * 60 * 1000; // 30 дни

    if (user.vipmonthly_last && now - user.vipmonthly_last < cooldown) {
        const remaining = cooldown - (now - user.vipmonthly_last);
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return interaction.reply({
            content: `⏳ Можеш да вземеш следващата VIP месечна награда след **${days} дни и ${hours} часа**.`,
            flags: 64
        });
    }

    const rewards = {
        1: 20000,
        2: 40000,
        3: 60000,
        4: 80000,
        5: 100000
    };

    const reward = rewards[user.vip_level] || 20000;

    updateBalance(id, reward);
    user.vipmonthly_last = now;

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 VIP Месечна Награда')
    .setDescription(`Получаваш **${reward} лв** за твоето VIP ниво!`)
    .addFields(
        { name: 'VIP Ниво', value: `${user.vip_level}`, inline: true },
        { name: 'Награда', value: `${reward} лв`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — VIP Monthly' });

    return interaction.reply({ embeds: [embed] });
}
