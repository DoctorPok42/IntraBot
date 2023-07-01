import { SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../templates/ApplicationCommand.js'
import type { newUser } from '../types/User'
import { createUser } from '../utils/functions.js'

export default new ApplicationCommand({
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registers you to the bot')
        .addStringOption((option) =>
            option
                .setName('cookie')
                .setDescription('Your cookie from the intra')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('intra-name')
                .setDescription('Your intra name')
                .setRequired(true)
        ),
    async execute(interaction): Promise<void> {
        const newUser: newUser = {
            userID: interaction.user.id,
            cookie: interaction.options.getString('cookie')!,
            intraName: interaction.options.getString('intra-name')!
        }

        console.log(newUser)

        const user = await createUser(newUser)

        const embed = {
            title: '✅ Success',
            description: `You have been registered to the bot. Your receive your info every day at 8am.`,
            color: 0x57f287
        }

        if (!user) {
            embed.title = '❌ Error'
            embed.description = `Invalid cookie or intra name. Please try again.`
            embed.color = 0xed4245
        }

        if (user == -1) {
            embed.title = '🚫 Error'
            embed.description = `You are already registered to the bot.`
            embed.color = 0xf9a72d
        }

        await interaction.reply({ embeds: [embed] })
    }
})
