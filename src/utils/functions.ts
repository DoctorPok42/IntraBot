import { Types } from 'mongoose'
import { User } from '../models/index.js'
import intraInfo from './intraInfo.json' assert { type: 'json' }
import type { newUser, userDB } from '../types/User'
import axios from 'axios'

async function getIntraInfo(
    cookie: string,
    intraUrl: string | undefined,
    intraName: string
) {
    const startLastMonth = new Date()
        .toISOString()
        .split('T')[0]
        .split('-')
        .join('-')
    const endLastMonth = new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .split('T')[0]
        .split('-')
        .join('-')

    for (var i = 0; i < intraInfo.length; i++) {
        if (intraInfo[i]?.name == intraName) {
            intraUrl = intraInfo[i]?.planning
            break
        }
    }

    if (!intraUrl) {
        return null
    }

    const newIntraUrl =
        intraUrl + `&start=${endLastMonth}&end=${startLastMonth}`

    const headers = {
        Cookie: `user=${cookie};`
    }

    // Check if the cookie is valid
    const verify = await axios
        .get(newIntraUrl, { headers: headers })
        .catch(() => {
            return null
        })

    if (!verify) {
        return null
    }

    return intraUrl
}

export async function createUser(newUser: newUser) {
    var intraUrl
    var userUrl
    var headers = {
        Cookie: `user=${newUser.cookie};`
    }

    // Check if the user is already registered
    const userRegistered = await User.findOne({ userID: newUser.userID })

    if (userRegistered) {
        return -1
    }

    // Check if the intra name is valid
    intraUrl = await getIntraInfo(newUser.cookie, intraUrl, newUser.intraName)

    if (!intraUrl) {
        return null
    }

    for (var i = 0; i < intraInfo.length; i++) {
        if (intraInfo[i]?.name == newUser.intraName) {
            userUrl = intraInfo[i]?.profil
            break
        }
    }

    if (!userUrl) {
        return null
    }

    // Get the user name
    const userRequest = await axios
        .get(userUrl, { headers: headers })
        .catch(() => {
            return null
        })

    if (!userRequest) {
        return null
    }
    const userRequestData = userRequest.data
    newUser.name = userRequestData.firstname

    // Create the user
    const user = new User({
        _id: new Types.ObjectId(),
        userID: newUser.userID,
        name: newUser.name,
        cookie: newUser.cookie,
        intra: {
            name: newUser.intraName,
            url: intraUrl
        }
    })

    try {
        await user.save()
    } catch (err) {
        console.log(err)
        return null
    }
    return user
}

export async function updateUser(newUser: newUser) {
    if (!newUser.cookie || !newUser.intraName) {
        return null
    }

    var intraUrl

    // Check if the intra name is valid
    intraUrl = await getIntraInfo(newUser.cookie, intraUrl, newUser.intraName)

    if (!intraUrl) {
        return null
    }

    const findUser = await User.findOne({ userID: newUser.userID }) as userDB

    if (!findUser) {
        return null
    }

    // Update the user
    try {
        User.findOneAndUpdate(
            { userID: newUser.userID },
            {
                cookie: newUser.cookie,
                intra: {
                    name: newUser.intraName,
                    url: intraUrl
                }
            }
        )
    } catch (err) {
        console.log(err)
        return null
    }

    return findUser
}

export async function getAllUsers() {
    const users: userDB[] = await User.find()

    if (!users) {
        return null
    }

    return users
}

export function formatDate(date: string) {
    const hours = date.split(':')[0]?.slice(-2)
    const minutes = date.split(':')[1]?.slice(0, 2)
    return hours + ':' + minutes
}
