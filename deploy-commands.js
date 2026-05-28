import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

const commands = [];
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);

    // ⏭️ Ако файлът не е команда (няма data), пропускаме го
    if (!command.data) {
        console.log(`⏭️ Пропускам файл (не е команда): ${file}`);
        continue;
    }

    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log('🌍 Регистрирам глобални slash команди...');
    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
                   { body: commands }
    );
    console.log('✅ Глобалните команди са регистрирани успешно.');
    console.log('⚠️ Забележка: Discord може да ги активира до 1 час.');
} catch (error) {
    console.error(error);
}
