import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown } from '../db.js';

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
.setName('weekly')
.setDescription('Вземи седмичната си награда');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();
    const last = getCooldown(id, 'weekly');

    if (last && now - last < WEEKLY_COOLDOWN) {
        const remaining = WEEKLY_COOLDOWN - (now - last);
        const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));

        return interaction.reply(`⏳ Седмичната награда ще е достъпна след ~${days} дни.`);
    }

    const user = getUser(id);

    // Рандом награда 1000–3000 лв
    const base = Math.floor(Math.random() * 2001) + 1000;
    const reward = Math.floor(base * (1 + user.vip_level * 0.2));

    const newBalance = updateBalance(id, reward);
    setCooldown(id, 'weekly', now);

    return interaction.reply(`📅 Получи **${reward} лв** седмична награда!\n💰 Нов баланс: **${newBalance} лв**`);
}
