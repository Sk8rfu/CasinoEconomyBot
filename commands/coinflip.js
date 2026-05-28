import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('coinflip')
.setDescription('Ези или тура')
.addStringOption(opt =>
opt.setName('избор')
.setDescription('heads или tails')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const choice = interaction.options.getString('избор').toLowerCase();
    const bet = interaction.options.getInteger('залог');
    const user = getUser(id);

    if (!["heads", "tails"].includes(choice)) {
        return interaction.reply("❌ Избери heads или tails.");
    }

    if (bet <= 0) return interaction.reply("❌ Залогът трябва да е положителен.");
    if (user.balance < bet) return interaction.reply("❌ Нямаш достатъчно пари.");

    const result = Math.random() < 0.5 ? "heads" : "tails";

    let win = 0;
    if (choice === result) {
        win = Math.floor(bet * 2 * (1 + user.vip_level * 0.1));
    }

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#DAA520')
    .setTitle('🪙 Coinflip')
    .addFields(
        { name: 'Резултат', value: `Монетата падна на **${result}**`, inline: true },
        { name: 'Твоят избор', value: choice, inline: true },
        { name: 'Печалба', value: win > 0 ? `🎉 **${win} лв**` : `💀 Загуби **${bet} лв**`, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'CasinoEconomyBot — Coinflip' });

    return interaction.reply({ embeds: [embed] });
}
