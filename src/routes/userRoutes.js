const express = require("express");
const userController = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/", requireAuth, requireAdmin, userController.listUsers);

// Public profile
router.get("/:id", userController.getProfile);


router.patch("/:id", requireAuth, userController.updateProfile);
router.delete("/:id", requireAuth, userController.deleteUser);

module.exports = router;
