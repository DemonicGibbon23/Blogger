const Comment = require("../models/commentModel");
const Report = require("../models/reportModel");
const Blog = require("../models/blogModel");


async function addComment({ blogId, authorId, content, parentCommentId = null }) {
  if (!content || !content.trim()) throw new Error("Comment content is required");
  if (content.trim().length > 3000) throw new Error("Comment must be 3000 characters or fewer");

  
  const blog = await Blog.findById(blogId);
  if (!blog || blog.status !== "published") throw new Error("Blog not found");

 
  if (parentCommentId) {
    const parent = await Comment.findById(parentCommentId);
    if (!parent || String(parent.blog) !== String(blogId)) {
      throw new Error("Parent comment not found");
    }
    if (parent.parentComment) {
      throw new Error("Replies to replies are not supported");
    }
  }

  const comment = await Comment.create({
    blog: blogId,
    author: authorId,
    content: content.trim(),
    parentComment: parentCommentId || null
  });

  return comment.populate("author", "name");
}


async function getCommentsForBlog(blogId) {
  const [topLevel, replies] = await Promise.all([
    Comment.find({ blog: blogId, parentComment: null })
      .sort({ createdAt: 1 })
      .populate("author", "name")
      .lean(),
    Comment.find({ blog: blogId, parentComment: { $ne: null } })
      .sort({ createdAt: 1 })
      .populate("author", "name")
      .lean()
  ]);

  
  const replyMap = new Map();
  for (const reply of replies) {
    const pid = String(reply.parentComment);
    if (!replyMap.has(pid)) replyMap.set(pid, []);
    replyMap.get(pid).push(reply);
  }

  return topLevel.map((c) => ({ ...c, replies: replyMap.get(String(c._id)) || [] }));
}


async function deleteComment(commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  
  await Comment.deleteMany({ parentComment: commentId });
  await Report.deleteMany({ target: commentId, targetType: "Comment" });
  await Comment.findByIdAndDelete(commentId);
}

module.exports = { addComment, getCommentsForBlog, deleteComment };
