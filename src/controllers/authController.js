
const authService = require("../services/authService");

async function register(req, res) {
    try {
        const user = await authService.registerUser({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        return res.status(201).json({
            message: "Registration successful",
            user
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        if (error.message.includes("required") ||
            error.message.includes("Password must") ||
            error.message.includes("Name cannot")) {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}

module.exports = { register };
