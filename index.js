import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';

global.pendingDuels = {};

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Зареждаме всички команди от папката /commands
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);

    // ⏭ Пропускаме файлове, които НЕ са команди (нямат data)
    if (!command.data) {
        console.log(`⏭ Пропускам файл (не е команда): ${file}`);
        continue;
    }

    client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, c => {
    console.log(`🤖 Ботът е онлайн като ${c.user.tag}`);

    const statuses = [
        "Играйте за големите печалби!",
        "Използвай /help за всички команди",
        "Отвори Mystery Box за редки предмети",
        "Събери SIN R1 — най-рeдкият предмет!",
        "Стани милионер с /work",
        "Продай предмети с /sell",
        "Провери профила си с /profile",
        "Печели VIP нива от Mystery Box",
        "Събирай български редки предмети!",
        "Най-добрият икономически бот!",
        "Само и единствено с левове"
    ];

    let index = 0;

    setInterval(() => {
        c.user.setActivity(statuses[index], { type: 0 }); // Playing
        index = (index + 1) % statuses.length;
    }, 30000);
});

// --- Глобална cooldown таблица ---
const cooldowns = new Map();

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // --- Cooldown система за всички команди ---
    const userId = interaction.user.id;
    const now = Date.now();
    const cooldownTime = 3000; // 3 секунди cooldown

    if (cooldowns.has(userId)) {
        const expiration = cooldowns.get(userId) + cooldownTime;

        if (now < expiration) {
            const remaining = ((expiration - now) / 1000).toFixed(1);
            return interaction.reply({
                content: `⏳ Моля изчакай още **${remaining} сек** преди да използваш команда отново.`,
                flags: 64
            });
        }
    }

    cooldowns.set(userId, now);

    // --- Изпълнение на командата ---
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: '⚠️ Възникна грешка при изпълнение на командата.',
            flags: 64
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
