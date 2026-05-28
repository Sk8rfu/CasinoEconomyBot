import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('dicebot')
.setDescription('Играй Dice Duel срещу бота')
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

    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    let result = "";
    let win = 0;

    if (playerRoll > botRoll) {
        const vipBonus = 1 + user.vip_level * 0.05;
        win = Math.floor(bet * vipBonus);
        updateBalance(id, win);
        result = `🎉 Победи бота и спечели **${win} лв**!`;
    } else if (playerRoll < botRoll) {
        updateBalance(id, -bet);
        result = `💀 Ботът те победи. Загуби **${bet} лв**.`;
    } else {
        result = "🤝 Равенство! Няма загуба или печалба.";
    }

    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle('🎲 Dice Duel — Срещу Бота')
    .addFields(
        { name: "Твоят зар", value: `${playerRoll}`, inline: true },
        { name: "Зар на бота", value: `${botRoll}`, inline: true }
    )
    .setDescription(result)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
