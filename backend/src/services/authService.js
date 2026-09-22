const bcrypt = require("bcrypt");

const User = require("../models/user.model");

// Register user
const registerUser = async (name, email, password) => {

    // Check whether user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    await user.save();

    return user;
};


// Login user
const loginUser = async (email, password) => {

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Compare password
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