import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('cardflip')
.setDescription('Избери една от трите карти и тествай късмета си!')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ Залогът трябва да е положително число.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ Нямаш достатъчно пари.", flags: 64 });
    }

    // Шансове
    let winChance = 0.33;

    if (hasEffect(id, "luck_small")) winChance += 0.05;
    if (hasEffect(id, "luck_big")) winChance += 0.15;

    const roll = Math.random();
    let result = "";
    let multiplier = 0;

    if (roll < winChance * 0.2) {
        result = "💎 Златна карта (x3)";
        multiplier = 3;
    } else if (roll < winChance) {
        result = "🔷 Синя карта (x2)";
        multiplier = 2;
    } else {
        result = "❌ Червена карта (lose)";
        multiplier = 0;
    }

    const vipBonus = 1 + user.vip_level * 0.05;
    const win = Math.floor(bet * multiplier * vipBonus);

    updateBalance(id, win - bet);

    const embed = new EmbedBuilder()
    .setColor(multiplier > 0 ? '#00FF00' : '#FF0000')
    .setTitle('🃏 Card Flip')
    .setDescription(`Ти изтегли: **${result}**`)
    .addFields(
        { name: "Залог", value: `${bet} лв`, inline: true },
        { name: "Множител", value: `${multiplier}x`, inline: true },
        { name: "Печалба", value: `${win} лв`, inline: true }
    )
    .setFooter({ text: "CasinoEconomyBot — Card Flip" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
