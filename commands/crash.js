import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('crash')
.setDescription('Играй Crash — multiplier игра')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
)
.addNumberOption(opt =>
opt.setName('cashout')
.setDescription('На какъв multiplier да се изплатиш (пример: 2.5)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const cashout = interaction.options.getNumber('cashout');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({
            content: "❌ Залогът трябва да е положително число.",
            flags: 64
        });
    }

    if (cashout < 1.01) {
        return interaction.reply({
            content: "❌ Cashout multiplier трябва да е поне **1.01x**.",
            flags: 64
        });
    }

    if (user.balance < bet) {
        return interaction.reply({
            content: "❌ Нямаш достатъчно пари за този залог.",
            flags: 64
        });
    }

    // Генерираме multiplier (краш)
    // Колкото по-висок multiplier, толкова по-малък шанс
    const crashPoint = generateCrashPoint();

    // VIP бонус
    const vipBonus = 1 + user.vip_level * 0.05;

    let win = 0;
    let resultText = "";

    if (cashout <= crashPoint) {
        win = Math.floor(bet * cashout * vipBonus);
        updateBalance(id, win - bet);
        resultText = `🎉 Успех! Crash стигна до **${crashPoint.toFixed(2)}x**\nТи cashout-на на **${cashout}x** и спечели **${win} лв**!`;
    } else {
        updateBalance(id, -bet);
        resultText = `💥 Crash се случи на **${crashPoint.toFixed(2)}x** преди твоя cashout **(${cashout}x)**.\nЗагуби **${bet} лв**.`;
    }

    const embed = new EmbedBuilder()
    .setColor(win > 0 ? '#00FF00' : '#FF0000')
    .setTitle('🎲 Crash Game')
    .setDescription(resultText)
    .addFields(
        { name: "Залог", value: `${bet} лв`, inline: true },
        { name: "Cashout", value: `${cashout}x`, inline: true },
        { name: "Crash Point", value: `${crashPoint.toFixed(2)}x`, inline: true }
    )
    .setFooter({ text: 'CasinoEconomyBot — Crash' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}

// --- Crash формула ---
// Колкото по-висок multiplier, толкова по-малък шанс да се случи
function generateCrashPoint() {
    const r = Math.random();
    return 1 / (1 - r); // класическа crash формула
}
