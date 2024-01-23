import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: string,
            required: true,
        },
    },
    { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
