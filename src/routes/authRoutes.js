const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth, rateLimiter } = require("../middleware/authMiddleware");

const router = express.Router();


const authRateLimit = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

router.post("/register", authRateLimit, authController.register);
router.post("/login", authRateLimit, authController.login);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
