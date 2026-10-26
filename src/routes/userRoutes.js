const express = require("express");
const userController = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin: list all users
router.get("/", requireAuth, requireAdmin, userController.listUsers);

// Public profile
router.get("/:id", userController.getProfile);

// Self-service profile update and account deletion
router.patch("/:id", requireAuth, userController.updateProfile);
router.delete("/:id", requireAuth, userController.deleteUser);

module.exports = router;
