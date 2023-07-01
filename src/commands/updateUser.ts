import { SlashCommandBuilder } from 'discord.js'
import ApplicationCommand from '../templates/ApplicationCommand.js'
import type { newUser } from '../types/User'
import { updateUser } from '../utils/functions.js'

export default new ApplicationCommand({
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Updates your user info')
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

        const user = await updateUser(newUser)

        const embed = {
            title: '✅ Success',
            description: `You have been updated to the bot.`,
            color: 0x5bd7e5
        }

        if (!user) {
            embed.title = '❌ Error'
            embed.description = `Invalid cookie or intra name. Please try again.`
            embed.color = 0xed4245
        }

        if (user == -1) {
            embed.title = '🚫 Error'
            embed.description = `You are not registered to the bot.`
            embed.color = 0xF9A72D
        }

        await interaction.reply({ embeds: [embed] })
    }
})
