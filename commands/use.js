import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getUser, updateUser, addEffect } from '../db.js';
import { items } from './shop.js';

export const data = new SlashCommandBuilder()
.setName('use')
.setDescription('Използвай предмет от инвентара')
.addStringOption(opt =>
opt.setName('id')
.setDescription('ID на предмета')
.setRequired(true)
);

export async function execute(interaction) {
    const userId = interaction.user.id;
    const itemId = interaction.options.getString('id');
    const user = getUser(userId);

    const inv = db.prepare(`
    SELECT amount FROM inventory WHERE user_id = ? AND item_id = ?
    `).get(userId, itemId);

    if (!inv || inv.amount <= 0)
        return interaction.reply("❌ Нямаш такъв предмет.");

    const item = items.find(i => i.id === itemId);
    if (!item) return interaction.reply("❌ Невалиден предмет.");

    let message = "";

    // ---------------- VIP ----------------
    if (itemId.startsWith("vip")) {
        const newLevel = Number(itemId.replace("vip", ""));

        if (newLevel > 5)
            return interaction.reply("❌ Максималното VIP ниво е 5.");

        if (user.vip_level >= newLevel)
            return interaction.reply("❌ Вече имаш това VIP ниво или по-високо.");

        updateUser(userId, { vip_level: newLevel });
        message = `👑 Повиши VIP нивото си до **${newLevel}**!`;
    }

    // ---------------- BOOSTS ----------------
    const boosts = {
        boost_slots: { time: 3600, msg: "🎰 Slots Boost активиран за 1 час!" },
        boost_blackjack: { time: 3600, msg: "🃏 Blackjack Boost активиран за 1 час!" },
        boost_duel: { time: 1800, msg: "⚔️ Duel Boost активиран за 30 минути!" },
        luck_small: { time: 3600, msg: "🍀 Малък късмет активиран за 1 час!" },
        luck_big: { time: 86400, msg: "🌟 Голям късмет активиран за 24 часа!" },
        crime_mask: { time: 3600, msg: "🦹 Crime Mask активирана за 1 час!" },
        rob_gloves: { time: 3600, msg: "🧤 Robbery Gloves активирани за 1 час!" },
        pvp_sword: { time: 1800, msg: "⚔️ Duel Sword активиран за 30 минути!" },
        pvp_shield: { time: 1800, msg: "🛡️ Duel Shield активиран за 30 минути!" }
    };

    if (boosts[itemId]) {
        addEffect(userId, itemId, boosts[itemId].time);
        message = boosts[itemId].msg;
    }

    // ---------------- CONSUMABLES ----------------
    if (itemId === "heal") {
        message = "🧪 Използва Healing Potion!";
    }

    if (itemId === "energy") {
        addEffect(userId, "energy", 3600); // 1 час
        message = "⚡ Намали cooldown-а на /work!";
    }

    // ---------------- SPECIAL ITEMS ----------------
    if (itemId === "loan_cut") {
        const newLoan = Math.floor(user.loan * 0.9);
        updateUser(userId, { loan: newLoan });
        message = "💳 Намали кредита си с 10%!";
    }

    if (itemId === "bank_ticket") {
        const newLimit = user.bank_limit + 5000;
        updateUser(userId, { bank_limit: newLimit });
        message = "🏦 Увеличи лимита на банката си с **+5 000 лв**!";
    }

    if (itemId === "bank_card") {
        const increase = Math.floor(user.bank_limit * 0.20);
        const newLimit = user.bank_limit + increase;
        updateUser(userId, { bank_limit: newLimit });
        message = `💳 Bank Card увеличи лимита ти с **+${increase} лв**!`;
    }

    if (itemId === "bank_card_gold") {
        const newLimit = user.bank_limit + 10000;
        updateUser(userId, { bank_limit: newLimit });
        message = "💳✨ GOLD Bank Card увеличи лимита ти с **+10 000 лв**!";
    }

    if (itemId === "bank_card_platinum") {
        const newLimit = user.bank_limit + 25000;
        updateUser(userId, { bank_limit: newLimit });
        message = "💳💠 PLATINUM Bank Card увеличи лимита ти с **+25 000 лв**!";
    }

    if (itemId === "bank_card_diamond") {
        const newLimit = user.bank_limit + 50000;
        updateUser(userId, { bank_limit: newLimit });
        message = "💳💎 DIAMOND Bank Card увеличи лимита ти с **+50 000 лв**!";
    }

    if (itemId === "phoenix") {
        addEffect(userId, "phoenix", 604800);
        message = "🔥 Phoenix Feather ще те спаси при следваща загуба!";
    }

    // Rare items (не се използват)
    if ([
        "diamond", "artifact", "sin_r1",
        "gold_trabant", "tsar_crown", "golden_lion",
        "pliska_relic", "kuker_mask", "golden_lev",
        "st_george_amulet"
    ].includes(itemId)) {
        return interaction.reply("💎 Този предмет не може да бъде използван.");
    }

    // ---------------- REMOVE ITEM ----------------
    db.prepare(`
    UPDATE inventory SET amount = amount - 1
    WHERE user_id = ? AND item_id = ?
    `).run(userId, itemId);

    // ---------------- EMBED ----------------
    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle(`🎒 Използва предмет: ${item.name}`)
    .setDescription(message)
    .setFooter({ text: 'CasinoEconomyBot — Инвентар' })
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
