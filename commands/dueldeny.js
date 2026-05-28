import { SlashCommandBuilder } from 'discord.js';
import { pendingDuels } from './duel.js';

export const data = new SlashCommandBuilder()
.setName('dueldeny')
.setDescription('Откажи дуела');

export async function execute(interaction) {
    const opponent = interaction.user;

    const duel = pendingDuels[opponent.id];
    if (!duel) {
        return interaction.reply("❌ Нямаш активна покана за дуел.");
    }

    delete pendingDuels[opponent.id];

    return interaction.reply("❌ Дуелът беше отказан.");
}
