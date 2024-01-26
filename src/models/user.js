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
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Middleware: Hash the password before saving (pre-save hook)
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


// check if a given password is correct
userSchema.methods.isPasswordCorrect = async function (password)
{
    return await bcrypt.compare(password, this.password)
}


export const User = mongoose.model('User', userSchema);
