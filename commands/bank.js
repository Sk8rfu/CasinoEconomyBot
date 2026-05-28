import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, updateBank } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('bank')
.setDescription('Банкови операции')
.addSubcommand(sub =>
sub
.setName('deposit')
.setDescription('Депозирай пари в банката')
.addIntegerOption(opt =>
opt.setName('сума').setDescription('Сума за депозит').setRequired(true)
)
)
.addSubcommand(sub =>
sub
.setName('withdraw')
.setDescription('Тегли пари от банката')
.addIntegerOption(opt =>
opt.setName('сума').setDescription('Сума за теглене').setRequired(true)
)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const user = getUser(id);
    const sub = interaction.options.getSubcommand();
    const amount = interaction.options.getInteger('сума');

    if (amount <= 0) {
        return interaction.reply('❌ Сумата трябва да е положително число.');
    }

    if (sub === 'deposit') {
        if (user.balance < amount) {
            return interaction.reply('❌ Нямаш толкова пари в портфейла.');
        }

        const newBank = updateBank(id, amount);

        if (newBank === false) {
            return interaction.reply(`❌ Не можеш да депозираш толкова. Лимитът ти е **${user.bank_limit} лв**.`);
        }

        updateBalance(id, -amount);

        return interaction.reply(`🏦 Депозира **${amount} лв**.\n📘 Банка: **${newBank} лв**`);

    }

    if (sub === 'withdraw') {
        if (user.bank < amount) {
            return interaction.reply('❌ Нямаш толкова пари в банката.');
        }

        updateBank(id, -amount);
        const newBalance = updateBalance(id, amount);

        return interaction.reply(`💸 Изтегли **${amount} лв**.\n💰 Портфейл: **${newBalance} лв**`);
    }
}
