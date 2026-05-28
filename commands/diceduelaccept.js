import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../db.js';

export const data = new SlashCommandBuilder()
.setName('diceduelaccept')
.setDescription('Приеми Dice Duel предизвикателство');

export async function execute(interaction) {
    const id = interaction.user.id;
    const duel = global.diceDuels[id];

    if (!duel) {
        return interaction.reply({ content: "❌ Нямаш активни предизвикателства.", flags: 64 });
    }

    const challenger = duel.challenger;
    const bet = duel.bet;

    const user1 = getUser(challenger);
    const user2 = getUser(id);

    if (user1.balance < bet || user2.balance < bet) {
        delete global.diceDuels[id];
        return interaction.reply({ content: "❌ Един от играчите няма достатъчно пари.", flags: 64 });
    }

    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;

    let result = "";
    let winner = null;

    if (roll1 > roll2) {
        winner = challenger;
        updateBalance(challenger, bet);
        updateBalance(id, -bet);
        result = `🎉 <@${challenger}> победи и спечели **${bet} лв**!`;
    } else if (roll2 > roll1) {
        winner = id;
        updateBalance(id, bet);
        updateBalance(challenger, -bet);
        result = `🎉 <@${id}> победи и спечели **${bet} лв**!`;
    } else {
        result = "🤝 Равенство! Няма печалба или загуба.";
    }

    delete global.diceDuels[id];

    const embed = new EmbedBuilder()
    .setColor('#00A6FF')
    .setTitle('🎲 Dice Duel — Резултат')
    .addFields(
        { name: "Зар на предизвикателя", value: `${roll1}`, inline: true },
        { name: "Зар на опонента", value: `${roll2}`, inline: true }
    )
    .setDescription(result)
    .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
