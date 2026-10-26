const express = require("express");
const voteController = require("../controllers/voteController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/:blogId", requireAuth, voteController.vote);

module.exports = router;
