import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('yahtzee')
.setDescription('Играй Yahtzee (5 зарчета)')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
);

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply('❌ Залогът трябва да е положително число.');
    if (user.balance < bet) return interaction.reply('❌ Нямаш достатъчно пари.');

    const dice = [rollDice(), rollDice(), rollDice(), rollDice(), rollDice()];
    const counts = {};

    for (const d of dice) counts[d] = (counts[d] || 0) + 1;

    let multiplier = 0;

    if (Object.values(counts).includes(5)) multiplier = 20;
    else if (Object.values(counts).includes(4)) multiplier = 10;
    else if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) multiplier = 7;
    else if (Object.values(counts).includes(3)) multiplier = 5;
    else if (Object.values(counts).includes(2)) multiplier = 2;

    const vipBonus = 1 + user.vip_level * 0.1;
    const win = Math.floor(bet * multiplier * vipBonus);

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#8B0000')
    .setTitle('🎲 Yahtzee')
    .setDescription(`Зарове: **${dice.join(' | ')}**`)
    .addFields(
        { name: 'Комбинация', value: multiplier > 0 ? `Множител ×${multiplier}` : 'Няма комбинация', inline: true },
        { name: 'Резултат', value: win > 0 ? `🎉 Спечели **${win} лв**!` : `💀 Загуби **${bet} лв**.`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Yahtzee' });

    return interaction.reply({ embeds: [embed] });
}
