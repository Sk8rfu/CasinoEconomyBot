import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, getEffects } from '../db.js';
import db from '../db.js';

export const data = new SlashCommandBuilder()
.setName('profile')
.setDescription('Показва профил на теб или друг потребител')
.addUserOption(option =>
option
.setName('потребител')
.setDescription('Потребител, чийто профил да видиш')
);

export async function execute(interaction) {
    const target = interaction.options.getUser('потребител') || interaction.user;
    const user = getUser(target.id);
    const effects = getEffects(target.id);

    const avatar = target.displayAvatarURL({ size: 256 });

    // --- Активни ефекти ---
    let effectsText = "Няма активни ефекти.";
    if (effects.length > 0) {
        effectsText = effects.map(e => {
            const remaining = e.expires_at - Math.floor(Date.now() / 1000);
            const minutes = Math.max(1, Math.floor(remaining / 60));
            return `• **${e.effect_id}** — ${minutes} мин`;
        }).join("\n");
    }

    // --- Rare Items ---
    const rareItems = db.prepare(`
    SELECT item_id, amount FROM inventory
    WHERE user_id = ? AND item_id IN (
        'diamond', 'artifact', 'sin_r1',
        'gold_trabant', 'tsar_crown', 'golden_lion',
        'pliska_relic', 'kuker_mask', 'golden_lev',
        'st_george_amulet'
    )
    `).all(target.id);

    let rareText = "Нямаш редки предмети.";
    if (rareItems.length > 0) {
        rareText = rareItems.map(r => {
            if (r.item_id === "diamond") return `💎 Diamond Token × ${r.amount}`;
            if (r.item_id === "artifact") return `📿 Ancient Artifact × ${r.amount}`;
            if (r.item_id === "sin_r1") return `🚗 SIN R1 × ${r.amount}`;
            if (r.item_id === "gold_trabant") return `🚙 Златен Трабант × ${r.amount}`;
            if (r.item_id === "tsar_crown") return `👑 Корона на Цар Симеон × ${r.amount}`;
            if (r.item_id === "golden_lion") return `🦁 Златен Лъв × ${r.amount}`;
            if (r.item_id === "pliska_relic") return `🏺 Реликва от Плиска × ${r.amount}`;
            if (r.item_id === "kuker_mask") return `🎭 Кукерска Маска × ${r.amount}`;
            if (r.item_id === "golden_lev") return `💰 Златен Лев × ${r.amount}`;
            if (r.item_id === "st_george_amulet") return `🛡️ Амулет на Свети Георги × ${r.amount}`;
        }).join("\n");
    }

    // --- Special Rank for SIN R1 ---
    let sinRank = "—";
    const hasSin = rareItems.some(r => r.item_id === "sin_r1" && r.amount > 0);
    if (hasSin) {
        sinRank = "🚗 Собственик на SIN R1 — Елитен колекционер";
    }

    // --- Embed ---
    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle(`👤 Профил на ${target.username}`)
    .setThumbnail(avatar)
    .addFields(
        { name: '💰 Баланс', value: `${user.balance} лв`, inline: true },
        { name: '🏦 Банка', value: `${user.bank} лв`, inline: true },
        { name: '💳 Кредит', value: `${user.loan} лв`, inline: true },
        { name: '📏 Банков лимит', value: `${user.bank_limit} лв`, inline: true },
        { name: '👑 VIP Ниво', value: `${user.vip_level}`, inline: true },
        { name: '🎁 Активни ефекти', value: effectsText },
        { name: '🏆 Редки предмети', value: rareText },
        { name: '🏅 Специален ранг', value: sinRank }
    )
    .setFooter({ text: 'CasinoEconomyBot' })
    .setTimestamp();

    // Ако играчът има SIN R1 → показваме снимка
    if (hasSin) {
        embed.setImage("https://sincars.co.uk/wp-content/uploads/2021/06/SIN-R1-5503.jpg");
    }

    return interaction.reply({ embeds: [embed] });
}
