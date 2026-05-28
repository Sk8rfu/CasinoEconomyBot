import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('about')
.setDescription('Информация за бота');

export async function execute(interaction) {

    const embed = new EmbedBuilder()
    .setColor('#00CED1')
    .setTitle('🤖 CasinoEconomyBot — Икономически Discord Бот')
    .setDescription('💰 *Икономика • Игри • PvP • Магазин • Ефекти*')
    .addFields(
        {
            name: '🎮 Основни функции',
            value:
            '• Икономика: баланс, банка, кредити\n' +
            '• Магазин с предмети, ефекти и буустове\n' +
            '• Инвентар и система за използване\n' +
            '• Хазартни игри: Slots, Blackjack, Roulette, Poker, Coinflip\n' +
            '• PvP дуели с оръжия, щитове и ефекти\n' +
            '• Престъпления: Crime & Rob\n' +
            '• Рангове, VIP нива, профили, класации'
        },
        {
            name: '👑 Създаден от',
            value: 'Sk8rfu'
        },
        {
            name: '📌 Полезни команди',
            value: '/help — списък с всички команди'
        }
    )
    .setFooter({ text: 'CasinoEconomyBot — Информация' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
