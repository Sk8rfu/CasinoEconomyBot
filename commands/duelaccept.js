import { SlashCommandBuilder } from 'discord.js';
import { getUser, updateBalance, hasEffect, removeEffect } from '../db.js';
import { pendingDuels } from './duel.js';

export const data = new SlashCommandBuilder()
.setName('duelaccept')
.setDescription('Приеми дуела');

export async function execute(interaction) {
    const opponent = interaction.user;

    const duel = pendingDuels[opponent.id];
    if (!duel) {
        return interaction.reply("❌ Нямаш активна покана за дуел.");
    }

    const challengerId = duel.challenger;
    const bet = duel.bet;

    const challenger = await interaction.client.users.fetch(challengerId);

    const cData = getUser(challengerId);
    const oData = getUser(opponent.id);

    // Проверка за пари
    if (cData.balance < bet || oData.balance < bet) {
        delete pendingDuels[opponent.id];
        return interaction.reply("❌ Един от играчите няма достатъчно пари.");
    }

    // --- Базови удари ---
    let cHit = Math.floor(Math.random() * 100) + 1 + cData.vip_level * 5;
    let oHit = Math.floor(Math.random() * 100) + 1 + oData.vip_level * 5;

    // --- PvP ефекти ---

    // ⚔️ Duel Boost (+20 сила)
    if (hasEffect(challengerId, "boost_duel")) cHit += 20;
    if (hasEffect(opponent.id, "boost_duel")) oHit += 20;

    // 🗡️ Duel Sword (+30 атака)
    if (hasEffect(challengerId, "pvp_sword")) cHit += 30;
    if (hasEffect(opponent.id, "pvp_sword")) oHit += 30;

    // 🛡️ Duel Shield (+30 защита)
    if (hasEffect(challengerId, "pvp_shield")) oHit -= 30;
    if (hasEffect(opponent.id, "pvp_shield")) cHit -= 30;

    // 🍀 Luck Small (+5% шанс)
    if (hasEffect(challengerId, "luck_small")) cHit += 5;
    if (hasEffect(opponent.id, "luck_small")) oHit += 5;

    // 🍀 Luck Big (+15% шанс)
    if (hasEffect(challengerId, "luck_big")) cHit += 15;
    if (hasEffect(opponent.id, "luck_big")) oHit += 15;

    // Минимален удар да не падне под 1
    cHit = Math.max(1, cHit);
    oHit = Math.max(1, oHit);

    let result = "";
    let winner = null;

    if (cHit > oHit) {
        winner = challenger;

        // 🔥 Phoenix Feather → спасява от загуба
        if (hasEffect(opponent.id, "phoenix")) {
            removeEffect(opponent.id, "phoenix");
            delete pendingDuels[opponent.id];
            return interaction.reply(
                `⚔️ **Дуел: ${challenger.username} vs ${opponent.username}**\n\n` +
                `🔸 ${challenger.username}: удар **${cHit}**\n` +
                `🔹 ${opponent.username}: удар **${oHit}**\n\n` +
                `🔥 Phoenix Feather спаси ${opponent.username} от загуба!\n` +
                `🤝 Залогът е върнат.`
            );
        }

        updateBalance(challengerId, bet);
        updateBalance(opponent.id, -bet);
        result = `🗡️ **${challenger.username} победи!**`;

    } else if (oHit > cHit) {
        winner = opponent;

        // 🔥 Phoenix Feather → спасява от загуба
        if (hasEffect(challengerId, "phoenix")) {
            removeEffect(challengerId, "phoenix");
            delete pendingDuels[opponent.id];
            return interaction.reply(
                `⚔️ **Дуел: ${challenger.username} vs ${opponent.username}**\n\n` +
                `🔸 ${challenger.username}: удар **${cHit}**\n` +
                `🔹 ${opponent.username}: удар **${oHit}**\n\n` +
                `🔥 Phoenix Feather спаси ${challenger.username} от загуба!\n` +
                `🤝 Залогът е върнат.`
            );
        }

        updateBalance(opponent.id, bet);
        updateBalance(challengerId, -bet);
        result = `🗡️ **${opponent.username} победи!**`;

    } else {
        result = "🤝 Равенство — никой не губи.";
    }

    delete pendingDuels[opponent.id];

    return interaction.reply(
        `⚔️ **Дуел: ${challenger.username} vs ${opponent.username}**\n\n` +
        `🔸 ${challenger.username}: удар **${cHit}**\n` +
        `🔹 ${opponent.username}: удар **${oHit}**\n\n` +
        `${result}\n` +
        (winner ? `💰 Победителят печели **${bet} лв**` : "")
    );
}
