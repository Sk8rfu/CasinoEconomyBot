import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { getUser, updateBalance, addItem, saveUser } from '../db.js';
import db from '../db.js';

export const data = new SlashCommandBuilder()
.setName('jackpotdraw')
.setDescription('Тегли победител от Jackpot-а (само админ)')
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {

    // Взимаме всички участници от SQL
    const participants = db.prepare(`
    SELECT id, jackpotTickets
    FROM users
    WHERE jackpotTickets > 0
    `).all();

    if (participants.length === 0) {
        return interaction.reply({ content: "❌ Няма tickets в Jackpot-а.", flags: 64 });
    }

    // Генерираме ticket pool
    let ticketPool = [];
    for (const p of participants) {
        for (let i = 0; i < p.jackpotTickets; i++) {
            ticketPool.push(p.id);
        }
    }

    const winnerId = ticketPool[Math.floor(Math.random() * ticketPool.length)];
    const winner = getUser(winnerId);

    // Награди
    const rewards = [
        { type: "money", amount: 50000 },
        { type: "money", amount: 100000 },
        { type: "money", amount: 250000 },
        { type: "money", amount: 500000 },

        { type: "item", id: "diamond", name: "Diamond Token" },
        { type: "item", id: "artifact", name: "Ancient Artifact" },
        { type: "item", id: "sin_r1", name: "SIN R1" },

        { type: "item", id: "boost_blackjack", name: "Blackjack Boost" },
        { type: "item", id: "boost_duel", name: "Duel Boost" }
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    let rewardText = "";

    if (reward.type === "money") {
        updateBalance(winnerId, reward.amount);
        rewardText = `💰 **${reward.amount} лв**`;
    } else {
        addItem(winnerId, reward.id, 1);
        rewardText = `🎁 **${reward.name}**`;
    }

    // Нулираме tickets в SQL
    db.prepare(`UPDATE users SET jackpotTickets = 0 WHERE id = ?`).run(winnerId);

    const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🏆 Jackpot — Победител!')
    .setDescription(
        `🎉 Победителят е: <@${winnerId}>\n` +
        `Награда: ${rewardText}`
    )
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
