import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('baccarat')
.setDescription('Играй Baccarat — избери Player, Banker или Tie')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
)
.addStringOption(opt =>
opt.setName('избор')
.setDescription('Player, Banker или Tie')
.addChoices(
    { name: 'Player', value: 'player' },
    { name: 'Banker', value: 'banker' },
    { name: 'Tie', value: 'tie' }
)
.setRequired(true)
);

function drawCard() {
    return Math.floor(Math.random() * 10); // 0–9
}

function baccaratSum(cards) {
    const total = cards.reduce((a, b) => a + b, 0);
    return total % 10;
}

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const choice = interaction.options.getString('избор');
    const user = getUser(id);

    if (bet <= 0) {
        return interaction.reply({ content: "❌ Залогът трябва да е положително число.", flags: 64 });
    }

    if (user.balance < bet) {
        return interaction.reply({ content: "❌ Нямаш достатъчно пари.", flags: 64 });
    }

    // Player cards
    const playerCards = [drawCard(), drawCard()];
    let playerSum = baccaratSum(playerCards);

    // Banker cards
    const bankerCards = [drawCard(), drawCard()];
    let bankerSum = baccaratSum(bankerCards);

    // Third card rule (simplified)
    if (playerSum <= 5) {
        playerCards.push(drawCard());
        playerSum = baccaratSum(playerCards);
    }

    if (bankerSum <= 5) {
        bankerCards.push(drawCard());
        bankerSum = baccaratSum(bankerCards);
    }

    let winner = "";
    if (playerSum > bankerSum) winner = "player";
    else if (bankerSum > playerSum) winner = "banker";
    else winner = "tie";

    // Multipliers
    const multipliers = {
        player: 2,
        banker: 1.95,
        tie: 8
    };

    let win = 0;

    if (choice === winner) {
        const vipBonus = 1 + user.vip_level * 0.05;
        win = Math.floor(bet * multipliers[winner] * vipBonus);
        updateBalance(id, win);
    } else {
        updateBalance(id, -bet);
    }

    const embed = new EmbedBuilder()
    .setColor(choice === winner ? '#00FF00' : '#FF0000')
    .setTitle('🃏 Baccarat — Резултат')
    .addFields(
        { name: "Player", value: `${playerCards.join(", ")} → **${playerSum}**`, inline: true },
               { name: "Banker", value: `${bankerCards.join(", ")} → **${bankerSum}**`, inline: true }
    )
    .addFields(
        { name: "Твоят избор", value: choice, inline: true },
        { name: "Победител", value: winner, inline: true },
        { name: "Печалба", value: `${win} лв`, inline: true }
    )
    .setFooter({ text: "CasinoEconomyBot — Baccarat" })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
