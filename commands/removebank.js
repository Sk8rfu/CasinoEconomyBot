import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('removebank')
.setDescription('Админ: Премахва лимит от банката на потребител')
.addUserOption(opt =>
opt.setName('потребител')
.setDescription('Потребителят')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('сума')
.setDescription('Колко да се премахне (0 = зануляване)')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('потребител');
    const amount = interaction.options.getInteger('сума');

    const user = getUser(target.id);

    if (amount < 0)
        return interaction.reply("❌ Сумата трябва да е 0 или повече.");

    let removed = amount;

    // Ако amount = 0 → зануляване
    if (amount === 0) {
        removed = user.bank_limit;
        updateUser(target.id, { bank_limit: 0 });
    } else {
        removed = Math.min(user.bank_limit, amount);
        updateUser(target.id, { bank_limit: user.bank_limit - removed });
    }

    const embed = new EmbedBuilder()
    .setColor('#FF3333')
    .setTitle('🏦 Премахване на банк лимит')
    .setDescription(`Премахнати са **${removed} лв** от банк лимита на **${target.username}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
