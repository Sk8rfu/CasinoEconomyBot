import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import db, { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('setvip')
.setDescription('Задай VIP ниво на потребител (админ)')
.addUserOption(opt =>
opt.setName('потребител')
.setDescription('Потребителят')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('ниво')
.setDescription('VIP ниво (0–5)')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('потребител');
    const level = interaction.options.getInteger('ниво');

    if (level < 0 || level > 5)
        return interaction.reply("❌ VIP нивото трябва да е между **0 и 5**.");

    getUser(target.id);
    db.prepare('UPDATE users SET vip_level = ? WHERE id = ?').run(level, target.id);

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('👑 Задаване на VIP ниво')
    .setDescription(`VIP нивото на **${target.username}** е зададено на **${level}**`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
