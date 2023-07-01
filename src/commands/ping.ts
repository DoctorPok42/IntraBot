import { SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../templates/ApplicationCommand.js'

export default new ApplicationCommand({
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies pong!'),
    async execute(interaction): Promise<void> {
        const embed = {
            title: 'Pong!',
            description: `🏓 Latence de l'API: ${interaction.client.ws.ping}ms.`,
            color: 0x5865F2
        }
        await interaction.reply({ embeds: [embed] })
    }
})
