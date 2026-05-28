import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';
import db from '../db.js';
import { items } from './shop.js';

export const data = new SlashCommandBuilder()
.setName('buy')
.setDescription('Купи предмет от магазина')
.addStringOption(opt =>
opt.setName('id')
.setDescription('ID на предмета')
.setRequired(true)
);

export async function execute(interaction) {
    const userId = interaction.user.id;
    const itemId = interaction.options.getString('id');
    const user = getUser(userId);

    const item = items.find(i => i.id === itemId);
    if (!item) return interaction.reply("❌ Невалиден предмет.");

    if (user.balance < item.price)
        return interaction.reply("❌ Нямаш достатъчно пари.");

    // 🟡 VIP предмети
    if (item.id.startsWith("vip")) {
        const newLevel = Number(item.id.replace("vip", ""));

        if (newLevel > 5) {
            return interaction.reply("❌ Максималното VIP ниво е 5.");
        }

        if (user.vip_level >= newLevel) {
            return interaction.reply("❌ Вече имаш това VIP ниво или по-високо.");
        }

        // Обновяваме VIP нивото
        db.prepare(`UPDATE users SET vip_level = ? WHERE id = ?`)
        .run(newLevel, userId);

        updateBalance(userId, -item.price);

        return interaction.reply(`👑 Повиши VIP нивото си до **${newLevel}**!`);
    }

    // 🟣 Boost ефекти
    if (item.id.startsWith("boost_")) {
        const expires = Math.floor(Date.now() / 1000) + 3600; // 1 час

        db.prepare(`
        INSERT INTO active_effects (user_id, effect_id, expires_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, effect_id)
        DO UPDATE SET expires_at = excluded.expires_at
        `).run(userId, item.id, expires);

        updateBalance(userId, -item.price);

        return interaction.reply(`⚡ Активира **${item.name}** за 1 час!`);
    }

    // 🧪 Consumables (heal, energy)
    if (["heal", "energy"].includes(item.id)) {
        db.prepare(`
        INSERT INTO inventory (user_id, item_id, amount)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, item_id)
        DO UPDATE SET amount = amount + 1
        `).run(userId, item.id);

        updateBalance(userId, -item.price);

        return interaction.reply(`🧪 Добави **${item.name}** в инвентара си!`);
    }

    // 🛡️ PvP предмети, Crime предмети, Rare предмети → инвентар
    db.prepare(`
    INSERT INTO inventory (user_id, item_id, amount)
    VALUES (?, ?, 1)
    ON CONFLICT(user_id, item_id)
    DO UPDATE SET amount = amount + 1
    `).run(userId, item.id);

    updateBalance(userId, -item.price);

    return interaction.reply(`🛒 Купи **${item.name}** за **${item.price} лв**!`);
}
