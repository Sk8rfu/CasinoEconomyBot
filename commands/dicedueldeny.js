import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('dicedueldenу')
.setDescription('Откажи Dice Duel предизвикателство');

export async function execute(interaction) {
    const id = interaction.user.id;

    if (!global.diceDuels[id]) {
        return interaction.reply({ content: "❌ Нямаш предизвикателства за отказ.", flags: 64 });
    }

    delete global.diceDuels[id];

    return interaction.reply({ content: "❌ Ти отказа дуела.", flags: 64 });
}
