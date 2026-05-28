import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import db, { getUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('resetcooldown')
.setDescription('Ресетва cooldown-ите на потребител (админ)')
.addUserOption(opt =>
opt.setName('потребител')
.setDescription('Потребителят')
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
    const target = interaction.options.getUser('потребител');

    getUser(target.id);

    db.prepare(`
    UPDATE users SET
    last_daily = NULL,
    last_weekly = NULL,
    last_monthly = NULL,
    last_work = NULL,
    last_rob = NULL,
    vipdaily_last = NULL,
    vipweekly_last = NULL,
    vipmonthly_last = NULL
    WHERE id = ?
    `).run(target.id);

    const embed = new EmbedBuilder()
    .setColor('#FF4444')
    .setTitle('🔄 Ресет на cooldown-и')
    .setDescription(`Всички cooldown-и (включително VIP) на **${target.username}** бяха успешно ресетнати.`)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
