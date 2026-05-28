import { SlashCommandBuilder } from 'discord.js';
import db from '../db.js';
import { items } from './shop.js';
import { updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('sell')
.setDescription('Продай предмет от инвентара')
.addStringOption(opt =>
opt.setName('id')
.setDescription('ID на предмета')
.setRequired(true)
);

export async function execute(interaction) {
    const userId = interaction.user.id;
    const itemId = interaction.options.getString('id');

    const inv = db.prepare(`
    SELECT amount FROM inventory WHERE user_id = ? AND item_id = ?
    `).get(userId, itemId);

    if (!inv || inv.amount <= 0)
        return interaction.reply("❌ Нямаш такъв предмет.");

    const item = items.find(i => i.id === itemId);
    if (!item) return interaction.reply("❌ Невалиден предмет.");

    const sellPrice = Math.floor(item.price * 0.5);

    updateBalance(userId, sellPrice);

    db.prepare(`
    UPDATE inventory SET amount = amount - 1
    WHERE user_id = ? AND item_id = ?
    `).run(userId, itemId);

    return interaction.reply(`💸 Продаде **${item.name}** за **${sellPrice} лв**.`);
}
