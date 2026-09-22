const authService = require("../services/auth.service");


// Register
const register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const user = await authService.registerUser(
            name,
            email,
            password
        );

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};


// Login
const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await authService.loginUser(
            email,
            password
        );

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        res.status(401).json({
            message: error.message
        });

    }
};


module.exports = {
    register,
    login
};