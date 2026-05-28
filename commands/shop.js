import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const items = [

    // 🟨 VIP
    { id: "vip1", name: "VIP Ниво 1", price: 50000, desc: "Дава +10% бонус печалба.", category: "VIP" },
{ id: "vip2", name: "VIP Ниво 2", price: 150000, desc: "Дава +20% бонус печалба.", category: "VIP" },
{ id: "vip3", name: "VIP Ниво 3", price: 300000, desc: "Дава +30% бонус печалба.", category: "VIP" },

// 🟦 Boosts
{ id: "boost_slots", name: "Slots Boost", price: 8000, desc: "Увеличава печалбите от /slots.", category: "Boosts" },
{ id: "boost_blackjack", name: "Blackjack Boost", price: 10000, desc: "По-добри шансове в /blackjack.", category: "Boosts" },
{ id: "boost_duel", name: "Duel Boost", price: 12000, desc: "Дава +20 сила в дуелите.", category: "Boosts" },

// 🍀 Luck
{ id: "luck_small", name: "Lucky Charm", price: 6000, desc: "Малък бонус към късмета.", category: "Luck" },
{ id: "luck_big", name: "Golden Clover", price: 20000, desc: "Голям бонус към късмета.", category: "Luck" },

// 🕵️ Crime
{ id: "crime_mask", name: "Crime Mask", price: 7000, desc: "Увеличава шанса за успешен /crime.", category: "Crime" },
{ id: "rob_gloves", name: "Robbery Gloves", price: 9000, desc: "Увеличава шанса за успешен /rob.", category: "Crime" },

// ⚔ PvP
{ id: "pvp_shield", name: "Duel Shield", price: 11000, desc: "Намалява щетите в дуелите.", category: "PvP" },
{ id: "pvp_sword", name: "Duel Sword", price: 15000, desc: "Увеличава щетите в дуелите.", category: "PvP" },

// 🧪 Consumables
{ id: "heal", name: "Healing Potion", price: 2000, desc: "Използва се с /use heal.", category: "Consumables" },
{ id: "energy", name: "Energy Drink", price: 1500, desc: "Намалява cooldown на /work.", category: "Consumables" },

// 💰 Economy
{ id: "bank_ticket", name: "Bank Ticket", price: 10000, desc: "Увеличава лимита на банката.", category: "Economy" },
{ id: "loan_cut", name: "Loan Reducer", price: 8000, desc: "Намалява кредита с 10%.", category: "Economy" },

// 💳 Bank Cards
{ id: "bank_card", name: "Bank Card", price: 25000, desc: "Увеличава лимита на банката с +20%.", category: "Bank Cards" },
{ id: "bank_card_gold", name: "Bank Card GOLD", price: 50000, desc: "Увеличава лимита на банката с +10 000 лв.", category: "Bank Cards" },
{ id: "bank_card_platinum", name: "Bank Card PLATINUM", price: 120000, desc: "Увеличава лимита на банката с +25 000 лв.", category: "Bank Cards" },
{ id: "bank_card_diamond", name: "Bank Card DIAMOND", price: 250000, desc: "Увеличава лимита на банката с +50 000 лв.", category: "Bank Cards" },

// 💎 Rare Items
{ id: "phoenix", name: "Phoenix Feather", price: 50000, desc: "Еднократно отменя загуба.", category: "Rare Items" },
{ id: "diamond", name: "Diamond Token", price: 75000, desc: "Много рядък предмет.", category: "Rare Items" },
{ id: "artifact", name: "Ancient Artifact", price: 100000, desc: "Мистериозен предмет с голяма стойност.", category: "Rare Items" },

// 🇧🇬 Bulgarian Artifacts
{ id: "gold_trabant", name: "Златен Трабант", price: 250000, desc: "Уникален български колекционерски автомобил.", category: "Bulgarian Artifacts" },
{ id: "tsar_crown", name: "Корона на Цар Симеон", price: 300000, desc: "Исторически артефакт от Първото българско царство.", category: "Bulgarian Artifacts" },
{ id: "golden_lion", name: "Златен Лъв", price: 200000, desc: "Символ на българската сила и независимост.", category: "Bulgarian Artifacts" },
{ id: "pliska_relic", name: "Реликва от Плиска", price: 180000, desc: "Артефакт от древната столица Плиска.", category: "Bulgarian Artifacts" },
{ id: "kuker_mask", name: "Кукерска Маска", price: 120000, desc: "Традиционна българска маска за прогонване на злото.", category: "Bulgarian Artifacts" },
{ id: "golden_lev", name: "Златен Лев", price: 220000, desc: "Колекционерска монета от чисто злато.", category: "Bulgarian Artifacts" },
{ id: "st_george_amulet", name: "Амулет на Свети Георги", price: 160000, desc: "Мощен защитен амулет.", category: "Bulgarian Artifacts" },

// 🚗 Vehicles
{ id: "sin_r1", name: "SIN R1", price: 1000000, desc: "Български суперавтомобил, произведен в Русе.", category: "Vehicles" }
];

export const data = new SlashCommandBuilder()
.setName('shop')
.setDescription('Показва наличните предмети в магазина');

export async function execute(interaction) {

    // Групиране по категории
    const categories = {};
    for (const item of items) {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    }

    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle('🛒 Магазин — Налични предмети')
    .setDescription('Използвай `/buy <id>` за покупка.')
    .setFooter({ text: 'CasinoEconomyBot — Магазин' })
    .setTimestamp();

    for (const category of Object.keys(categories)) {
        let text = "";
        for (const item of categories[category]) {
            text += `**${item.name}** — ${item.price} лв\n`;
            text += `📝 ${item.desc}\n`;
            text += `🆔 \`${item.id}\`\n\n`;
        }

        embed.addFields({
            name: `📦 ${category}`,
            value: text
        });
    }

    return interaction.reply({ embeds: [embed] });
}
