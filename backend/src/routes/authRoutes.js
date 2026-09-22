const express = require("express");

const authController = require("../controllers/authController");

const {
    validateAuthData
} = require("../middleware/authMiddleware");

const router = express.Router();


// Register
router.post(
    "/register",
    validateAuthData,
    authController.register
);


// Login
router.post(
    "/login",
    validateAuthData,
    authController.login
);


module.exports = router;