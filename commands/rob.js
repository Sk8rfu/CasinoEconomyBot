import { SlashCommandBuilder } from 'discord.js';
import {
    getUser,
    updateBalance,
    getCooldown,
    setCooldown,
    hasEffect,
    removeEffect
} from '../db.js';

const ROB_COOLDOWN = 10 * 60 * 1000; // 10 минути
const MIN_TARGET_BALANCE = 2500;     // Минимално за да бъде ограбен

export const data = new SlashCommandBuilder()
.setName('rob')
.setDescription('Опитай да ограбиш друг потребител')
.addUserOption(opt =>
opt.setName('потребител')
.setDescription('Кого искаш да ограбиш')
.setRequired(true)
);

export async function execute(interaction) {
    const thief = interaction.user;
    const target = interaction.options.getUser('потребител');

    if (thief.id === target.id) {
        return interaction.reply('❌ Не можеш да ограбиш себе си.');
    }

    const now = Date.now();
    const last = getCooldown(thief.id, 'rob');

    if (last && now - last < ROB_COOLDOWN) {
        const remaining = ROB_COOLDOWN - (now - last);
        const minutes = Math.ceil(remaining / 60000);
        return interaction.reply(`⏳ Трябва да почакаш още **${minutes} минути**.`);
    }

    const thiefData = getUser(thief.id);
    const targetData = getUser(target.id);

    // ❌ Ако има по-малко от 2500 → не може да бъде ограбен
    if (targetData.balance < MIN_TARGET_BALANCE) {
        return interaction.reply('❌ Този потребител няма достатъчно пари, за да бъде ограбен.');
    }

    // Базов шанс за успех
    let successChance = 0.4 + thiefData.vip_level * 0.05;

    if (hasEffect(thief.id, "rob_gloves")) successChance += 0.20;
    if (hasEffect(thief.id, "luck_small")) successChance += 0.05;
    if (hasEffect(thief.id, "luck_big")) successChance += 0.15;

    const success = Math.random() < successChance;

    if (success) {
        // 💰 Кражба: 10% – 35% от баланса
        const percent = Math.random() * 0.25 + 0.10;
        const stolen = Math.floor(targetData.balance * percent);

        updateBalance(target.id, -stolen);
        const newBalance = updateBalance(thief.id, stolen);

        setCooldown(thief.id, 'rob', now);

        return interaction.reply(
            `🦹‍♂️ Успешно ограби **${target.username}** и взе **${stolen} лв**!\n` +
            `💰 Нов баланс: **${newBalance} лв**`
        );
    } else {
        // 🚨 Глоба: 5% – 15% от баланса на крадеца
        const percent = Math.random() * 0.10 + 0.05;
        let fine = Math.floor(thiefData.balance * percent);

        // Минимална и максимална глоба
        if (fine < 250) fine = 250;
        if (fine > 20000) fine = 20000;

        // 🔥 Phoenix Feather → спасява от глоба
        if (hasEffect(thief.id, "phoenix")) {
            removeEffect(thief.id, "phoenix");
            fine = 0;
            setCooldown(thief.id, 'rob', now);
            return interaction.reply(`🔥 Phoenix Feather те спаси от глоба!`);
        }

        updateBalance(thief.id, -fine);
        setCooldown(thief.id, 'rob', now);

        return interaction.reply(
            `🚨 Провал! Полицията те хвана и плати глоба **${fine} лв**.`
        );
    }
}
