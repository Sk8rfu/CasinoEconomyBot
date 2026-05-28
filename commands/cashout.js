import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('cashout')
.setDescription('Вземи печалбата от Mines Multi');

export async function execute(interaction) {
    const id = interaction.user.id;
    const game = global.minesGames[id];

    if (!game) {
        return interaction.reply({
            content: "❌ Нямаш активна Mines Multi игра.",
            flags: 64
        });
    }

    const user = getUser(id);
    const vipBonus = 1 + user.vip_level * 0.05;

    const win = Math.floor(game.bet * game.multiplier * vipBonus);

    updateBalance(id, win);
    delete global.minesGames[id];

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('💰 Cashout успешен!')
    .setDescription(
        `Множител: **${game.multiplier.toFixed(2)}x**\n` +
        `VIP бонус: **${(vipBonus * 100 - 100).toFixed(0)}%**\n\n` +
        `Печелиш: **${win} лв**`
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
