import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('give')
.setDescription('Дай пари на друг потребител')
.addUserOption(opt =>
opt.setName('потребител').setDescription('На кого да дадеш пари').setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('сума').setDescription('Колко пари да дадеш').setRequired(true)
);

export async function execute(interaction) {
    const sender = interaction.user;
    const receiver = interaction.options.getUser('потребител');
    const amount = interaction.options.getInteger('сума');

    if (receiver.id === sender.id) {
        return interaction.reply('❌ Не можеш да даваш пари на себе си.');
    }

    if (amount <= 0) {
        return interaction.reply('❌ Сумата трябва да е положителна.');
    }

    const senderData = getUser(sender.id);

    if (senderData.balance < amount) {
        return interaction.reply('❌ Нямаш достатъчно пари.');
    }

    updateBalance(sender.id, -amount);
    const newReceiverBalance = updateBalance(receiver.id, amount);

    return interaction.reply(
        `🤝 **${sender.username}** даде **${amount} лв** на **${receiver.username}**!\n` +
        `💰 Нов баланс на ${receiver.username}: **${newReceiverBalance} лв**`
    );
}
