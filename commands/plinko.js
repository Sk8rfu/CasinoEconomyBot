import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('plinko')
.setDescription('Играй Plinko — избери риск и пусни топчето!')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
)
.addStringOption(opt =>
opt.setName('риск')
.setDescription('Ниво на риск')
.addChoices(
    { name: 'Low', value: 'low' },
    { name: 'Medium', value: 'medium' },
    { name: 'High', value: 'high' }
)
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const risk = interaction.options.getString('риск');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ Залогът трябва да е положително число.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ Нямаш достатъчно пари.", flags: 64 });
    }

    // Множители според риска
    const multipliers = {
        low:    [0.5, 0.7, 1, 1.2, 1.5, 2],
        medium: [0.3, 0.6, 1, 1.5, 2.5, 4],
        high:   [0.1, 0.3, 1, 2, 5, 10]
    };

    const list = multipliers[risk];
    const index = Math.floor(Math.random() * list.length);
    const multiplier = list[index];

    const vipBonus = 1 + user.vip_level * 0.05;
    const win = Math.floor(bet * multiplier * vipBonus);

    updateBalance(id, win - bet);

    const embed = new EmbedBuilder()
    .setColor(multiplier >= 1 ? '#00FF00' : '#FF0000')
    .setTitle('🎯 Plinko')
    .setDescription(
        `Топчето падна в колона **${index + 1}**!\n` +
        `Множител: **${multiplier}x**`
    )
    .addFields(
        { name: "Залог", value: `${bet} лв`, inline: true },
        { name: "Печалба", value: `${win} лв`, inline: true },
        { name: "Риск", value: risk, inline: true }
    )
    .setFooter({ text: "CasinoEconomyBot — Plinko" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
