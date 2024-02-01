import mongoose from 'mongoose';

import { USER_TEMPORARY_TOKEN_EXPIRY } from "../constants.js";

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
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
        refreshToken: {
            type: String,
        }
    },
    { timestamps: true }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
    try {
        if(this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 8);
            next();
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
});


userSchema.methods.isPasswordCorrect = async function (password)
{
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateTemporaryToken = function () {
    // This token should be client facing
    // for example: for email verification unHashedToken should go into the user's mail
    const unHashedToken = crypto.randomBytes(20).toString("hex");

    // This should stay in the DB to compare at the time of verification
    const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
    const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

    return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model('User', userSchema);