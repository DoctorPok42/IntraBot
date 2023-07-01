import mongoose from 'mongoose'
import 'dotenv/config'
const { DBCONNECTION } = process.env

const connectMongoDB = () => {
    const mongOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
    }

    mongoose.connect(DBCONNECTION as string, mongOptions)
    mongoose.Promise = global.Promise
    mongoose.connection.on('error', (err) => {
        console.error(`🚫 → ${err.message}`)
    })
    mongoose.connection.once('connected', () => {
        console.log('🚀 → MongoDB connected')
    })
}

export default connectMongoDB
