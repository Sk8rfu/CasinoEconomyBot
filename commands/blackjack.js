import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect, removeEffect } from '../db.js';

const cards = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function drawCard() {
    return cards[Math.floor(Math.random() * cards.length)];
}

function cardValue(card) {
    if (card === "A") return 11;
    if (["J", "Q", "K"].includes(card)) return 10;
    return parseInt(card);
}

function calculateHand(hand) {
    let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
    let aces = hand.filter(c => c === "A").length;

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

export const data = new SlashCommandBuilder()
.setName('blackjack')
.setDescription('Играй Blackjack срещу дилъра')
.addIntegerOption(opt =>
opt.setName('залог')
.setDescription('Колко искаш да заложиш')
.setRequired(true)
);

export async function execute(interaction) {
    const id = interaction.user.id;
    const bet = interaction.options.getInteger('залог');
    const user = getUser(id);

    if (bet <= 0) return interaction.reply("❌ Залогът трябва да е положителен.");
    if (user.balance < bet) return interaction.reply("❌ Нямаш достатъчно пари.");

    const boosted = hasEffect(id, "boost_blackjack");

    let player = [drawCard(), drawCard()];
    while (calculateHand(player) < (boosted ? 16 : 17)) player.push(drawCard());

    let dealer = [drawCard(), drawCard()];
    while (calculateHand(dealer) < (boosted ? 19 : 17)) dealer.push(drawCard());

    const playerTotal = calculateHand(player);
    const dealerTotal = calculateHand(dealer);

    let result = "";
    let win = 0;

    // 🎯 Основна логика
    if (playerTotal > 21) {
        result = "💀 Бюст! Загуби.";
    }
    else if (dealerTotal > 21 || playerTotal > dealerTotal) {
        result = "🎉 Победи дилъра!";
        win = Math.floor(bet * (1 + user.vip_level * 0.1));
    }
    else if (playerTotal === dealerTotal) {
        result = "🤝 Равенство — залогът е върнат.";
        win = bet;
    }
    else {
        result = "💀 Загуби.";
    }

    // 🍀 Luck Small → шанс да превърне равенство в победа
    if (hasEffect(id, "luck_small")) {
        if (playerTotal === dealerTotal) {
            result = "🍀 Късметът е с теб — печелиш!";
            win = Math.floor(bet * (1 + user.vip_level * 0.1));
        }
    }

    // 🌟 Luck Big → шанс да превърне загуба в равенство
    if (hasEffect(id, "luck_big")) {
        if (result === "💀 Загуби." && Math.random() < 0.15) {
            result = "🌟 Голям късмет — спасен си от загуба!";
            win = bet;
        }
    }

    // 🔥 Phoenix Feather → спасява от загуба
    if (result === "💀 Загуби." && hasEffect(id, "phoenix")) {
        removeEffect(id, "phoenix");
        result = "🔥 Phoenix Feather те спаси от загуба!";
        win = bet; // връща залога
    }

    updateBalance(id, -bet + win);

    const embed = new EmbedBuilder()
    .setColor('#228B22')
    .setTitle('🃏 Blackjack')
    .addFields(
        { name: 'Твоите карти', value: `${player.join(", ")} → **${playerTotal}**` },
               { name: 'Картите на дилъра', value: `${dealer.join(", ")} → **${dealerTotal}**` },
               { name: 'Резултат', value: result }
    )
    .setFooter({ text: win > 0 ? `Печалба: ${win} лв` : `Загуба: ${bet} лв` })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
