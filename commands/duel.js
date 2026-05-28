import { SlashCommandBuilder } from 'discord.js';
import { getUser } from '../db.js';

export const pendingDuels = {};

export const data = new SlashCommandBuilder()
.setName('duel')
.setDescription('Предизвикай друг играч на дуел')
.addUserOption(opt =>
opt.setName('играч')
.setDescription('Кого искаш да предизвикаш')
.setRequired(true)
)
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко да заложите')
.setRequired(true)
);

export async function execute(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('играч');
    const bet = interaction.options.getInteger('залог');

    if (challenger.id === opponent.id) {
        return interaction.reply("❌ Не можеш да дуелираш себе си.");
    }

    const cData = getUser(challenger.id);
    const oData = getUser(opponent.id);

    if (cData.balance < bet) {
        return interaction.reply("❌ Нямаш достатъчно пари.");
    }

    if (oData.balance < bet) {
        return interaction.reply(`❌ ${opponent.username} няма достатъчно пари.`);
    }

    // Записваме дуела
    pendingDuels[opponent.id] = {
        challenger: challenger.id,
        bet: bet
    };

    return interaction.reply(
        `⚔️ **${challenger.username} предизвика ${opponent.username} на дуел за ${bet} лв!**\n` +
        `👉 ${opponent.username}, използвай **/duelaccept** или **/dueldeny**`
    );
}
