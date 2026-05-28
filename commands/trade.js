import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { items } from './shop.js';

export const data = new SlashCommandBuilder()
.setName('trade')
.setDescription('Изпрати предмет на друг играч')
.addUserOption(opt =>
opt.setName('потребител')
.setDescription('На кого искаш да изпратиш предмет')
.setRequired(true)
)
.addStringOption(opt =>
opt.setName('item')
.setDescription('ID на предмета (виж /inventory)')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Количество')
.setRequired(true)
);

export async function execute(interaction) {
    const senderId = interaction.user.id;
    const receiver = interaction.options.getUser('потребител');
    const itemId = interaction.options.getString('item');
    const amount = interaction.options.getInteger('amount');

    if (receiver.id === senderId) {
        return interaction.reply("❌ Не можеш да търгуваш със себе си.");
    }

    if (amount <= 0) {
        return interaction.reply("❌ Количеството трябва да е поне 1.");
    }

    // Проверка дали item ID е валиден
    const item = items.find(i => i.id === itemId);
    if (!item) {
        return interaction.reply("❌ Невалидно ID на предмет. Провери /inventory.");
    }

    // Проверка дали изпращачът има предмета
    const row = db.prepare(`
    SELECT amount FROM inventory WHERE user_id = ? AND item_id = ?
    `).get(senderId, itemId);

    if (!row || row.amount < amount) {
        return interaction.reply(`❌ Нямаш достатъчно **${item.name}**.`);
    }

    // Премахване от изпращача
    db.prepare(`
    UPDATE inventory SET amount = amount - ?
    WHERE user_id = ? AND item_id = ?
    `).run(amount, senderId, itemId);

    // Ако количеството стане 0 → изтриваме реда
    db.prepare(`
    DELETE FROM inventory WHERE user_id = ? AND item_id = ? AND amount <= 0
    `).run(senderId, itemId);

    // Добавяне към получателя
    db.prepare(`
    INSERT INTO inventory (user_id, item_id, amount)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, item_id)
    DO UPDATE SET amount = amount + excluded.amount
    `).run(receiver.id, itemId, amount);

    // Embed за потвърждение
    const embed = new EmbedBuilder()
    .setColor('#00FF7F')
    .setTitle('📦 Успешен Trade')
    .setDescription(
        `**${interaction.user.username}** изпрати **${amount}× ${item.name}** на **${receiver.username}**`
    )
    .addFields(
        { name: "Предмет", value: `${item.name}`, inline: true },
        { name: "Количество", value: `${amount}`, inline: true },
        { name: "ID", value: `\`${item.id}\``, inline: true }
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
