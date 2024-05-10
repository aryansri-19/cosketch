import mongoose from "mongoose";

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    roomId: {
        type: String,
    }
})

export const UserModel = mongoose.models.User || mongoose.model("User", User, 'users');