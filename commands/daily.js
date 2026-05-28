import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown } from '../db.js';

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
.setName('daily')
.setDescription('Вземи дневната си награда');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();
    const last = getCooldown(id, 'daily');

    if (last && now - last < DAILY_COOLDOWN) {
        const remaining = DAILY_COOLDOWN - (now - last);
        const hours = Math.ceil(remaining / (1000 * 60 * 60));

        return interaction.reply(`⏳ Вече си взел дневната награда. Опитай пак след ~${hours} часа.`);
    }

    const user = getUser(id);

    // Рандом награда 100–500 лв + VIP бонус
    const base = Math.floor(Math.random() * 401) + 100;
    const reward = Math.floor(base * (1 + user.vip_level * 0.2));

    const newBalance = updateBalance(id, reward);
    setCooldown(id, 'daily', now);

    return interaction.reply(`🎁 Получи **${reward} лв**!\n💰 Нов баланс: **${newBalance} лв**`);
}
