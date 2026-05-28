import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, getCooldown, setCooldown, hasEffect } from '../db.js';

const MIN_COOLDOWN = 5 * 60 * 1000;   // 5 минути
const MAX_COOLDOWN = 10 * 60 * 1000;  // 10 минути

export const data = new SlashCommandBuilder()
.setName('work')
.setDescription('Работи и изкарай малко пари (5–10 мин cooldown)');

export async function execute(interaction) {
    const id = interaction.user.id;
    const now = Date.now();

    // Проверка за Energy Drink
    const energyActive = hasEffect(id, "energy");

    // Ако има Energy Drink → cooldown е 50% по-кратък
    const minCD = energyActive ? MIN_COOLDOWN / 2 : MIN_COOLDOWN;
    const maxCD = energyActive ? MAX_COOLDOWN / 2 : MAX_COOLDOWN;

    const last = getCooldown(id, 'work');
    if (last && now - last < minCD) {
        const remaining = minCD - (now - last);
        const minutes = Math.ceil(remaining / 60000);
        return interaction.reply(`⏳ Трябва да почакаш още **${minutes} минути**, преди да работиш пак.`);
    }

    // ВЗИМАМЕ ДАННИТЕ НА ПОТРЕБИТЕЛЯ
    const userData = getUser(id);

    // Рандом заплата 150–450 лв
    const base = Math.floor(Math.random() * 301) + 150;

    // VIP бонус: +10% на ниво
    const salary = Math.floor(base * (1 + userData.vip_level * 0.1));

    const newBalance = updateBalance(id, salary);

    // Слагаме cooldown между minCD и maxCD
    const randomCooldown = Math.floor(Math.random() * (maxCD - minCD)) + minCD;
    setCooldown(id, 'work', now);

    return interaction.reply(
        `🛠️ Работи здраво и изкара **${salary} лв**!\n💰 Нов баланс: **${newBalance} лв**`
    );
}
