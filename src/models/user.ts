import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,

    userID: { type: String, default: "" },
    name: { type: String, default: "" },
    cookie: { type: String, default: "" },
    infoDate: { type: Number, default: 8 },

    intra : {
        type: Object,
        name: { type: String, default: "" },
        url: { type: String, default: "" },
    }
});

export default model('User', userSchema);
