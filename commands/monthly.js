import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown } from '../db.js';

const MONTHLY_COOLDOWN = 30 * 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder()
.setName('monthly')
.setDescription('Вземи месечната си награда');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();
    const last = getCooldown(id, 'monthly');

    if (last && now - last < MONTHLY_COOLDOWN) {
        const remaining = MONTHLY_COOLDOWN - (now - last);
        const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));

        return interaction.reply(`⏳ Месечната награда ще е достъпна след ~${days} дни.`);
    }

    const user = getUser(id);

    // Рандом награда 5000–10000 лв
    const base = Math.floor(Math.random() * 5001) + 5000;
    const reward = Math.floor(base * (1 + user.vip_level * 0.2));

    const newBalance = updateBalance(id, reward);
    setCooldown(id, 'monthly', now);

    return interaction.reply(`📆 Получи **${reward} лв** месечна награда!\n💰 Нов баланс: **${newBalance} лв**`);
}
