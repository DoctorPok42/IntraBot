export type newUser = {
    userID: string
    name?: string
    cookie: string
    intraName: string
}

export type userDB = {
    _id: string
    userID: string
    name?: string
    cookie: string
    intra: {
        name: string
        url: string
    }
}
