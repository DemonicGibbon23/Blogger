const commentService = require("../services/commentService");
const Comment = require("../models/commentModel");

async function getComments(req, res) {
  try {
    const comments = await commentService.getCommentsForBlog(req.params.blogId);
    return res.json({ comments });
  } catch (error) {
    console.error("getComments error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function addComment(req, res) {
  try {
    const comment = await commentService.addComment({
      blogId: req.params.blogId,
      authorId: req.session.userId,
      content: req.body.content,
      parentCommentId: req.body.parentCommentId || null
    });
    return res.status(201).json({ comment });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("not found") ||
      error.message.includes("not supported") ||
      error.message.includes("characters")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("addComment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function deleteComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = String(comment.author) === String(req.session.userId);
    if (!isOwner && req.session.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await commentService.deleteComment(req.params.commentId);
    return res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("deleteComment error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { getComments, addComment, deleteComment };
