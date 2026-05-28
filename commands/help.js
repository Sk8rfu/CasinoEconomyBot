import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
.setName('help')
.setDescription('Показва всички команди и тяхното описание');

export async function execute(interaction) {

    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('📘 Помощно меню — Команди')
    .setDescription('Всички налични команди, подредени по категории.')
    .addFields(
        {
            name: '💰 Икономика',
            value:
            '/balance • /bank • /loan • /payloan\n' +
            '/work • /daily • /weekly • /monthly\n' +
            '/give'
        },
        {
            name: '🛒 Магазин и инвентар',
            value:
            '/shop • /buy • /sell • /inventory\n' +
            '/use • /trade • /effects'
        },
        {
            name: '🎰 Хазартни игри',
            value:
            '/slots • /slots10 • /slots50 • /blackjack\n' +
            '/roulette • /poker • /coinflip • /rps • /yahtzee\n' +
            '/crash • /mines • /minesmulti • /open • /cashout\n' +
            '/cardflip • /plinko • /dicebot • /baccarat'
        },
        {
            name: '⚔️ PvP Дуел',
            value:
            '/duel • /duelaccept • /dueldeny\n' +
            '/diceduel • /diceduelaccept • /dicedueldeny'
        },
        {
            name: '🦹 Престъпления',
            value: '/crime • /rob'
        },
        {
            name: '🎁 Mystery Box',
            value: '/mysterybox'
        },
        {
            name: '🎡 Daily Spin',
            value: '/spin — завърти колелото на късмета (24 часа)'
        },
        {
            name: '🏆 Jackpot',
            value:
            '/jackpot — виж участниците и шансовете\n' +
            '/jackpotdraw — тегли победител (админ)'
        },
        {
            name: '👑 VIP Команди',
            value: '/vip • /vipdaily • /vipweekly • /vipmonthly'
        },
        {
            name: '🏆 Статистики',
            value: '/profile • /leaderboard • /rank • /ranklist'
        },
        {
            name: '🛠️ Админ команди',
            value:
            '/setvip • /resetcooldown • /setmoney\n' +
            '/addmoney • /removemoney • /addbank • /removebank\n' +
            '/jackpotdraw'
        },
        {
            name: 'ℹ️ Информация',
            value: '/about'
        }
    )
    .setFooter({ text: 'CasinoEconomyBot — Помощно меню' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
