import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('roulette')
.setDescription('Играй рулетка')
.addStringOption(opt =>
opt.setName('заложи_на')
.setDescription('red, black, green или число 0–36')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const choice = interaction.options.getString('заложи_на').toLowerCase();
    const bet = interaction.options.getInteger('залог');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply("❌ Залогът трябва да е положителен.");
    if (user.balance < bet) return interaction.reply("❌ Нямаш достатъчно пари.");

    const validColors = ["red", "black", "green"];
    const isNumber = !isNaN(choice) && Number(choice) >= 0 && Number(choice) <= 36;

    if (!validColors.includes(choice) && !isNumber) {
        return interaction.reply("❌ Невалиден избор. Използвай red, black, green или число 0–36.");
    }

    const result = Math.floor(Math.random() * 37);
    const color = result === 0 ? "green" : (result % 2 === 0 ? "black" : "red");

    let multiplier = 0;

    if (isNumber && Number(choice) === result) multiplier = 35;
    else if (!isNumber && choice === color) multiplier = choice === "green" ? 15 : 2;

    const win = Math.floor(bet * multiplier * (1 + user.vip_level * 0.1));
    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor(color === "red" ? '#FF0000' : color === "black" ? '#000000' : '#00FF00')
    .setTitle('🎰 Roulette')
    .addFields(
        { name: 'Резултат', value: `**${result} (${color})**`, inline: true },
               { name: 'Твоят избор', value: choice, inline: true },
               { name: 'Печалба', value: win > 0 ? `🎉 **${win} лв**` : `💀 Загуби **${bet} лв**`, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Roulette' });

    return interaction.reply({ embeds: [embed] });
}
