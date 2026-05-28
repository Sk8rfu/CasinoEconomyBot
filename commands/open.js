import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('open')
.setDescription('Отвори поле в Mines Multi')
.addIntegerOption(opt =>
opt.setName('поле')
.setDescription('Кое поле отваряш (1–25)')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const pick = interaction.options.getInteger('поле');

    const game = global.minesGames[id];

    if (!game) {
        return interaction.reply({
            content: "❌ Нямаш активна Mines Multi игра. Използвай /minesmulti.",
            flags: 64
        });
    }

    if (pick < 1 || pick > 25) {
        return interaction.reply({ content: "❌ Полето трябва да е между **1 и 25**.", flags: 64 });
    }

    if (game.opened.has(pick)) {
        return interaction.reply({ content: "⚠️ Това поле вече е отворено.", flags: 64 });
    }

    const isMine = game.minePositions.has(pick);

    if (isMine) {
        delete global.minesGames[id];

        const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💥 Мина!')
        .setDescription(`Попадна на мина и загуби своя залог.`)
        .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

    // Безопасно поле
    game.opened.add(pick);
    game.multiplier += 0.25; // расте с всяко безопасно поле

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('💎 Безопасно поле!')
    .setDescription(
        `Отвори поле **${pick}** успешно!\n` +
        `Текущ множител: **${game.multiplier.toFixed(2)}x**\n\n` +
        `Отвори следващо поле с **/open** или вземи печалбата с **/cashout**`
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
