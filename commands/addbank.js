import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('addbank')
.setDescription('Админ: Добавя лимит към банката на потребител')
.addUserOption(opt =>
opt.setName('потребител')
.setDescription('Потребителят')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('сума')
.setDescription('Колко да се добави към лимита')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('потребител');
    const amount = interaction.options.getInteger('сума');

    if (amount <= 0)
        return interaction.reply("❌ Сумата трябва да е положителна.");

    const user = getUser(target.id);
    const newLimit = user.bank_limit + amount;

    updateUser(target.id, { bank_limit: newLimit });

    const embed = new EmbedBuilder()
    .setColor('#0099FF')
    .setTitle('🏦 Добавяне на банк лимит')
    .setDescription(`Лимитът на банката на **${target.username}** е увеличен с **${amount} лв**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
