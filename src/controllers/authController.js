const authService = require("../services/authService");

async function register(req, res) {
  try {
    const user = await authService.registerUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    // Establish session immediately after registration
    req.session.userId = user.id;
    req.session.role = user.role;

    return res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    if (error.code === 11000 || error.message.includes("already exists")) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    if (
      error.message.includes("required") ||
      error.message.includes("Password must") ||
      error.message.includes("Name cannot") ||
      error.message.includes("100 characters")
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Registration error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function login(req, res) {
  try {
    const user = await authService.loginUser({
      email: req.body.email,
      password: req.body.password
    });

    // Establish session
    req.session.userId = user.id;
    req.session.role = user.role;

    return res.json({ message: "Login successful", user });
  } catch (error) {
    if (error.message === "Invalid email or password" || error.message.includes("required")) {
      return res.status(401).json({ message: error.message });
    }

    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("bloggr.sid");
    return res.json({ message: "Logged out" });
  });
}

async function me(req, res) {
  // requireAuth middleware already verified the session; attach full user from DB
  const User = require("../models/userModel");
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    console.error("GET /me error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { register, login, logout, me };
