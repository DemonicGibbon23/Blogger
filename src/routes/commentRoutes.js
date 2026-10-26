const express = require("express");
const commentController = require("../controllers/commentController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });

// /api/comments/:blogId/
router.get("/:blogId", commentController.getComments);
router.post("/:blogId", requireAuth, commentController.addComment);
router.delete("/:blogId/:commentId", requireAuth, commentController.deleteComment);

module.exports = router;
