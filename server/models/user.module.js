import mongoose from "mongoose";
import connectDb from "../db/connectDb.js";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    restPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,

},
{
    timestamps: true
});

export const User = connectDb.model('User', userSchema);