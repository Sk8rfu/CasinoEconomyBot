import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('addmoney')
.setDescription('Админ: Добавя пари на потребител')
.addUserOption(opt =>
opt.setName('user')
.setDescription('Потребителят, на когото да дадеш пари')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('amount')
.setDescription('Сумата за добавяне')
.setRequired(true)
);

export async function execute(interaction) {

    // Проверка за админ
    if (!interaction.member.permissions.has('Administrator'))
        return interaction.reply("❌ Нямаш права да използваш тази команда.");

    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0)
        return interaction.reply("❌ Сумата трябва да е положително число.");

    updateBalance(target.id, amount);

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 Добавяне на пари')
    .setDescription(`Добавени са **${amount} лв** на **${target.username}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
