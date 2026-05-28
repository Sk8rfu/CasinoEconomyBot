import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, addItem, saveUser } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('spin')
.setDescription('Завърти колелото на късмета (24 часа cooldown)');

export async function execute(interaction) {
    const id = interaction.user.id;
    const user = getUser(id);

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    // Проверка за cooldown
    if (user.spinCooldown && now - user.spinCooldown < cooldown) {
        const remaining = cooldown - (now - user.spinCooldown);
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return interaction.reply({
            content: `⏳ Можеш да въртиш отново след **${hours} часа и ${minutes} минути**.`,
            flags: 64
        });
    }

    // Награди
    const rewards = [
        { type: "money", amount: 500 },
        { type: "money", amount: 1000 },
        { type: "money", amount: 2500 },
        { type: "money", amount: 5000 },

        { type: "item", id: "luck_small", name: "Lucky Charm" },
        { type: "item", id: "boost_slots", name: "Slots Boost" },
        { type: "item", id: "heal", name: "Healing Potion" },
        { type: "item", id: "energy", name: "Energy Drink" },

        { type: "item", id: "crime_mask", name: "Crime Mask" },
        { type: "item", id: "rob_gloves", name: "Robbery Gloves" },

        { type: "rare", id: "phoenix", name: "Phoenix Feather", chance: 0.01 },

        { type: "jackpot", name: "Jackpot Ticket" }
    ];

    // Рядък шанс
    const roll = Math.random();
    let reward;

    if (roll < 0.01) {
        reward = { type: "rare", id: "phoenix", name: "Phoenix Feather" };
    } else {
        reward = rewards[Math.floor(Math.random() * (rewards.length - 1))];
    }

    let message = "";

    // 💰 ПАРИ
    if (reward.type === "money") {
        const newBalance = updateBalance(id, reward.amount);

        // Синхронизация с global.users
        global.users = global.users || {};
        global.users[id] = global.users[id] || {};
        global.users[id].balance = newBalance;

        message = `💰 Спечели **${reward.amount} лв**!`;
    }

    // 🎁 ПРЕДМЕТ
    else if (reward.type === "item") {
        addItem(id, reward.id, 1);
        message = `🎁 Получи предмет: **${reward.name}**`;
    }

    // 💎 РЯДЪК ПРЕДМЕТ
    else if (reward.type === "rare") {
        addItem(id, reward.id, 1);
        message = `💎 Рядък предмет! Получи **${reward.name}**`;
    }

    // 🎟 JACKPOT TICKET
    else if (reward.type === "jackpot") {
        user.jackpotTickets = (user.jackpotTickets || 0) + 1;
        saveUser(id, user);

        global.users = global.users || {};
        global.users[id] = global.users[id] || {};
        global.users[id].jackpotTickets = user.jackpotTickets;

        message = `🎟️ Получи **Jackpot Ticket**!\nТой автоматично участва в /jackpot`;
    }

    // ⏳ ЗАПИСВАМЕ COOLDOWN
    user.spinCooldown = now;
    saveUser(id, user);

    // Синхронизация само на cooldown-а
    global.users = global.users || {};
    global.users[id] = global.users[id] || {};
    global.users[id].spinCooldown = now;

    // Embed
    const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🎡 Колело на късмета — Резултат')
    .setDescription(message)
    .setFooter({ text: 'CasinoEconomyBot — Daily Spin' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
