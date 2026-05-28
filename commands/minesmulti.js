import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

global.minesGames = global.minesGames || {};

export const data = new SlashCommandBuilder()
.setName('minesmulti')
.setDescription('Започни Mines Multi игра')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('мини')
.setDescription('Брой мини (1–10)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const mines = interaction.options.getInteger('мини');
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

    // Ако вече има активна игра
    if (global.minesGames[id]) {
        return interaction.reply({
            content: "⚠️ Вече имаш активна Mines Multi игра. Използвай /open или /cashout.",
            flags: 64
        });
    }

    // Генерираме мините
    const minePositions = new Set();
    while (minePositions.size < mines) {
        minePositions.add(Math.floor(Math.random() * 25) + 1);
    }

    // Запазваме играта
    global.minesGames[id] = {
        bet,
        mines,
        minePositions,
        opened: new Set(),
        multiplier: 1.0
    };

    updateBalance(id, -bet);

    const embed = new EmbedBuilder()
    .setColor('#00AAFF')
    .setTitle('💣 Mines Multi — Стартирана игра')
    .setDescription(
        `Залог: **${bet} лв**\nМини: **${mines}**\n\n` +
        `Отвори поле с командата **/open поле:число** (1–25)\n` +
        `Когато си готов, използвай **/cashout**`
    )
    .setFooter({ text: "CasinoEconomyBot — Mines Multi" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
