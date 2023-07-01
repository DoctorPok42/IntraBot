import { Events } from 'discord.js'
import Event from '../templates/Event.js'

export default new Event({
    name: Events.ClientReady,
    once: true,
    async execute(client: any) {
        await client.user.setPresence({
            activities: [
                {
                    name: 'with intranet'
                }
            ],
            status: 'online'
        })

        console.log(`🚀 → Bot connected as ${client.user.tag}`)
    }
})
