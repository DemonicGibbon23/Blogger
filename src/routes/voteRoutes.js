const express = require("express");
const voteController = require("../controllers/voteController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/votes/:blogId  { value: 1 or -1 }
router.post("/:blogId", requireAuth, voteController.vote);

module.exports = router;
