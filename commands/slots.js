import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect, removeEffect } from '../db.js';

const symbols = ["🍒", "🍋", "🍇", "⭐", "💎"];

export const data = new SlashCommandBuilder()
.setName('slots')
.setDescription('Играй на слот машина')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply('❌ Залогът трябва да е положително число.');
    if (user.balance < bet) return interaction.reply('❌ Нямаш достатъчно пари.');

    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];

    let multiplier = 0;

    // 🎰 Основни печалби
    if (r1 === r2 && r2 === r3) multiplier = 10;
    else if (r1 === r2 || r2 === r3 || r1 === r3) multiplier = 5;

    // 🍀 Luck ефекти
    let luckBonus = 0;

    if (hasEffect(id, "luck_small")) luckBonus += 0.05;
    if (hasEffect(id, "luck_big")) luckBonus += 0.15;

    // шанс да подобрим резултата
    if (Math.random() < luckBonus) {
        multiplier = Math.max(multiplier, 5); // поне двойка
    }

    // 👑 VIP бонус
    const vipBonus = 1 + user.vip_level * 0.1;

    // 💰 Изчисляване на печалбата
    let win = Math.floor(bet * multiplier * vipBonus);

    // 🎯 Slots Boost
    if (hasEffect(id, "boost_slots")) {
        win = Math.floor(win * 1.5);
    }

    // 🔥 Phoenix Feather → спасява от загуба
    if (win === 0 && hasEffect(id, "phoenix")) {
        removeEffect(id, "phoenix");
        win = bet; // връща залога
    }

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#FF4500')
    .setTitle('🎰 Слот Машина')
    .setDescription(`| ${r1} | ${r2} | ${r3} |`)
    .addFields(
        { name: 'Залог', value: `${bet} лв`, inline: true },
        { name: 'Резултат', value: win > 0 ? `🎉 Спечели **${win} лв**!` : `💀 Загуби залога си.`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Slots' });

    return interaction.reply({ embeds: [embed] });
}
