import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../db.js';

global.diceDuels = global.diceDuels || {};

export const data = new SlashCommandBuilder()
.setName('diceduel')
.setDescription('Предизвикай играч на Dice Duel')
.addUserOption(opt =>
opt.setName('играч')
.setDescription('Кого предизвикваш')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Залогът за дуела')
.setRequired(true)
);

export async function execute(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('играч');
    const bet = interaction.options.getInteger('залог');

    if (challenger.id === opponent.id) {
        return interaction.reply({ content: "❌ Не можеш да предизвикаш себе си.", flags: 64 });
    }

    const user1 = getUser(challenger.id);
    const user2 = getUser(opponent.id);

    if (user1.balance < bet) {
        return interaction.reply({ content: "❌ Нямаш достатъчно пари.", flags: 64 });
    }

    if (user2.balance < bet) {
        return interaction.reply({ content: "❌ Опонентът няма достатъчно пари.", flags: 64 });
    }

    global.diceDuels[opponent.id] = {
        challenger: challenger.id,
        bet
    };

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🎲 Dice Duel — Предизвикателство')
    .setDescription(
        `${challenger.username} предизвика ${opponent.username}!\n` +
        `Залог: **${bet} лв**\n\n` +
        `👉 ${opponent}, използвай **/diceduelaccept** или **/dicedueldenу**`
    );

    return interaction.reply({ embeds: [embed] });
}
