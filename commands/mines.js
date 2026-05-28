import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('mines')
.setDescription('Играй Mines — избери поле и се надявай да не е мина!')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('мини')
.setDescription('Брой мини (1–10)')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('поле')
.setDescription('Кое поле отваряш (1–25)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const mines = interaction.options.getInteger('мини');
    const pick = interaction.options.getInteger('поле');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ Залогът трябва да е положително число.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ Нямаш достатъчно пари.", flags: 64 });
    }

    if (mines < 1 || mines > 10) {
        return interaction.reply({ content: "❌ Мини трябва да са между **1 и 10**.", flags: 64 });
    }

    if (pick < 1 || pick > 25) {
        return interaction.reply({ content: "❌ Полето трябва да е между **1 и 25**.", flags: 64 });
    }

    // Генерираме мините
    const minePositions = new Set();
    while (minePositions.size < mines) {
        minePositions.add(Math.floor(Math.random() * 25) + 1);
    }

    const isMine = minePositions.has(pick);

    // VIP бонус
    const vipBonus = 1 + user.vip_level * 0.05;

    let win = 0;
    let resultText = "";
    let color = "#FF0000";

    if (isMine) {
        updateBalance(id, -bet);
        resultText = `💥 Попадна на **мина**! Загуби **${bet} лв**.`;
    } else {
        // Колкото повече мини → толкова по-голям множител
        const multiplier = 1 + (mines * 0.25);
        win = Math.floor(bet * multiplier * vipBonus);

        updateBalance(id, win - bet);
        resultText = `🎉 Безопасно поле! Печелиш **${win} лв**!`;
        color = "#00FF00";
    }

    // Визуално поле 5x5
    let board = "";
    for (let i = 1; i <= 25; i++) {
        if (i === pick) {
            board += isMine ? "💣 " : "💎 ";
        } else {
            board += "⬛ ";
        }
        if (i % 5 === 0) board += "\n";
    }

    const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle("💣 Mines Game")
    .setDescription(resultText)
    .addFields(
        { name: "Залог", value: `${bet} лв`, inline: true },
        { name: "Мини", value: `${mines}`, inline: true },
        { name: "Поле", value: `${pick}`, inline: true }
    )
    .addFields({ name: "Поле 5x5", value: board })
    .setFooter({ text: "CasinoEconomyBot — Mines" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
