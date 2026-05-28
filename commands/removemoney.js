import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('removemoney')
.setDescription('Админ: Премахва пари от потребител')
.addUserOption(opt =>
opt.setName('user')
.setDescription('Потребителят, от когото да премахнеш пари')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Сумата за премахване (или 0 за зануляване)')
.setRequired(true)
);

export async function execute(interaction) {

    // Проверка за админ
    if (!interaction.member.permissions.has('Administrator'))
        return interaction.reply("❌ Нямаш права да използваш тази команда.");

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const user = getUser(target.id);

    let removed = amount;

    if (amount < 0)
        return interaction.reply("❌ Сумата трябва да е 0 или повече.");

    // Ако amount = 0 → зануляване
    if (amount === 0) {
        removed = user.balance;
        updateBalance(target.id, -user.balance);
    } else {
        removed = Math.min(user.balance, amount);
        updateBalance(target.id, -removed);
    }

    const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('💸 Премахване на пари')
    .setDescription(`Премахнати са **${removed} лв** от **${target.username}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
