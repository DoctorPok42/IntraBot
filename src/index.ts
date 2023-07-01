/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'dotenv/config'

import {
    Client,
    GatewayIntentBits,
    Collection,
    Partials,
    EmbedBuilder
} from 'discord.js'
import { readdirSync } from 'fs'
import type ApplicationCommand from './templates/ApplicationCommand.js'
import type Event from './templates/Event.js'
import type MessageCommand from './templates/MessageCommand.js'
import type { userDB } from './types/User.js'
import deployGlobalCommands from './deployGlobalCommands.js'
import cron from 'node-cron'
const { TOKEN } = process.env

import connectMongoDB from './utils/mongoose.js'
import { formatDate, getAllUsers } from './utils/functions.js'
import axios from 'axios'

await deployGlobalCommands()

await connectMongoDB()

// Discord client object
global.client = Object.assign(
    new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages
        ],
        partials: [Partials.Channel]
    }),
    {
        commands: new Collection<string, ApplicationCommand>(),
        msgCommands: new Collection<string, MessageCommand>()
    }
)

// Set each command in the commands folder as a command in the client.commands collection
const commandFiles: string[] = readdirSync('./commands').filter(
    (file) => file.endsWith('.js') || file.endsWith('.ts')
)
for (const file of commandFiles) {
    const command: ApplicationCommand = (await import(`./commands/${file}`))
        .default as ApplicationCommand
    client.commands.set(command.data.name, command)
}

const msgCommandFiles: string[] = readdirSync('./messageCommands').filter(
    (file) => file.endsWith('.js') || file.endsWith('.ts')
)
for (const file of msgCommandFiles) {
    const command: MessageCommand = (await import(`./messageCommands/${file}`))
        .default as MessageCommand
    client.msgCommands.set(command.name, command)
}

// Event handling
const eventFiles: string[] = readdirSync('./events').filter(
    (file) => file.endsWith('.js') || file.endsWith('.ts')
)

for (const file of eventFiles) {
    const event: Event = (await import(`./events/${file}`)).default as Event
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

// Collect data from intra
async function collectData() {
    const allUsers = (await getAllUsers()) as userDB[]
    const date = new Date().toISOString().split('T')[0].split('-').join('-')
    var headers = {}
    var intraUrl = ''

    allUsers.forEach(async (user) => {
        headers = {
            Cookie: `user=${user.cookie};`
        }

        intraUrl = user.intra.url + `&start=${date}&end=${date}`

        const data = await axios.get(intraUrl, { headers: headers })

        if (data.data.length > 0) {
            var embed = new EmbedBuilder()
                .setTitle("Today's events")
                .setColor('#0099ff')
                .setFields(
                    data.data.map((event: any) => {
                        const room =
                            event.room.code == null
                                ? 'Bureau'
                                : event.room.code.split('/')[
                                      event.room.code.split('/').length - 1
                                  ]
                        return {
                            name: event.title,
                            value:
                                `:clock${formatDate(event.start)
                                    .split(':')[0]
                                    ?.slice(1, 2)}: ` +
                                formatDate(event.start) +
                                ' - ' +
                                formatDate(event.end) +
                                '\n' +
                                '📍 Room: ' +
                                room,
                            inline: true
                        }
                    })
                )
                .setTimestamp()

            // send message to user
            const userDM = await client.users.fetch(user.userID)

            await userDM.send({ embeds: [embed] })
        }
    })
}

cron.schedule('0 8 * * *', () => {
    collectData()
})

await client.login(TOKEN)
