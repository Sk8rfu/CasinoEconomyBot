import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('loan')
.setDescription('Вземи кредит от банката')
.addIntegerOption(opt =>
opt.setName('сума')
.setDescription('Сума на кредита')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const amount = interaction.options.getInteger('сума');
    const user = getUser(id);

    if (user.loan > 0) {
        return interaction.reply('❌ Трябва първо да изплатиш текущия си кредит.');
    }

    if (amount <= 0 || amount > 10000) {
        return interaction.reply('❌ Можеш да вземеш кредит между **1 и 10 000 лв**.');
    }

    const interestRate = 1.20; // +20% лихва
    const loanWithInterest = Math.floor(amount * interestRate);

    updateBalance(id, amount);

    // Записваме кредита
    user.loan = loanWithInterest;
    const db = (await import('../db.js')).default;
    db.prepare('UPDATE users SET loan = ? WHERE id = ?').run(loanWithInterest, id);

    return interaction.reply(
        `🏦 Взе кредит от **${amount} лв**.\n` +
        `📌 С лихвата трябва да върнеш: **${loanWithInterest} лв** (+20%)`
    );
}
