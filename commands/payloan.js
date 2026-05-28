import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('payloan')
.setDescription('Изплати част или целия си кредит')
.addIntegerOption(opt =>
opt.setName('сума')
.setDescription('Колко да платиш')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const amount = interaction.options.getInteger('сума');
    const user = getUser(id);

    if (user.loan <= 0) {
        return interaction.reply('❌ Нямаш активен кредит.');
    }

    if (amount <= 0) {
        return interaction.reply('❌ Сумата трябва да е положителна.');
    }

    if (user.balance < amount) {
        return interaction.reply('❌ Нямаш достатъчно пари.');
    }

    updateBalance(id, -amount);

    let remaining = user.loan - amount;
    if (remaining < 0) remaining = 0;

    const db = (await import('../db.js')).default;
    db.prepare('UPDATE users SET loan = ? WHERE id = ?').run(remaining, id);

    return interaction.reply(
        `💸 Плати **${amount} лв** по кредита.\n` +
        `📘 Остатък: **${remaining} лв**`
    );
}
