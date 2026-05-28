import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('setmoney')
.setDescription('Админ: Задава директно баланс на потребител')
.addUserOption(opt =>
opt.setName('потребител')
.setDescription('Потребителят')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('сума')
.setDescription('Новият баланс')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('потребител');
    const amount = interaction.options.getInteger('сума');

    if (amount < 0)
        return interaction.reply("❌ Балансът не може да бъде отрицателен.");

    getUser(target.id);
    updateUser(target.id, { balance: amount });

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💰 Задаване на баланс')
    .setDescription(`Балансът на **${target.username}** е зададен на **${amount} лв**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
