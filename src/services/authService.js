
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const registerUser = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new Error("Name, email and password are required");
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
        throw new Error("Name cannot be empty");
    }

    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
    }

    const existingUser = await User.findOne({
        email: cleanEmail
    });

    if (existingUser) {
        throw new Error("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
};

const loginUser = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    return user;
};

module.exports = {
    registerUser,
    loginUser
};
