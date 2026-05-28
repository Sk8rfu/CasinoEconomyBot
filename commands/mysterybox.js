import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, updateUser } from '../db.js';
import db from '../db.js';
import { items } from './shop.js';
import { mysteryRewards } from './mysteryRewards.js';

export const data = new SlashCommandBuilder()
.setName('mysterybox')
.setDescription('Отвори Mystery Box (25 000 лв)');

export async function execute(interaction) {
    const userId = interaction.user.id;
    const user = getUser(userId);

    const cost = 25000;

    if (user.balance < cost)
        return interaction.reply("❌ Нямаш достатъчно пари.");

    updateBalance(userId, -cost);

    const roll = Math.random() * 100;
    let sum = 0;
    let reward = null;

    for (const r of mysteryRewards) {
        sum += r.chance;
        if (roll <= sum) {
            reward = r;
            break;
        }
    }

    if (!reward || reward.type === "nothing")
        return interaction.reply("📦 Mystery Box беше празна...");

    // 💰 ПАРИ
    if (reward.type === "money") {
        updateBalance(userId, reward.amount);
        return interaction.reply(`📦 Получи **${reward.amount} лв**!`);
    }

    // 👑 VIP НАГРАДА (НЕ СЕ СТАКВА)
    if (reward.type === "vip") {
        const MAX_VIP = 5;          // максимално VIP ниво
        const newVip = reward.level; // Mystery Box дава директно VIP 1 или VIP 2

        // Ако играчът е на максимума → даваме пари
        if (user.vip_level >= MAX_VIP) {
            updateBalance(userId, 20000);
            return interaction.reply(
                "👑 Вече си на максимално VIP ниво! Получаваш **20 000 лв** вместо това."
            );
        }

        // Ако играчът вече е на по-високо VIP → не го понижаваме
        if (user.vip_level >= newVip) {
            return interaction.reply(
                `👑 Mystery Box ти даде VIP +${reward.level}, но ти вече имаш по-високо VIP ниво!`
            );
        }

        // Задаваме новото VIP ниво (директно, без стакване)
        const finalVip = Math.min(newVip, MAX_VIP);
        updateUser(userId, { vip_level: finalVip });

        return interaction.reply(`👑 Mystery Box ти даде **VIP ${finalVip}**!`);
    }

    // 🎁 ПРЕДМЕТ
    if (reward.type === "item") {
        db.prepare(`
        INSERT INTO inventory (user_id, item_id, amount)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, item_id)
        DO UPDATE SET amount = amount + 1
        `).run(userId, reward.id);

        const item = items.find(i => i.id === reward.id);
        return interaction.reply(`🎁 Mystery Box ти даде предмет: **${item.name}**!`);
    }
}
