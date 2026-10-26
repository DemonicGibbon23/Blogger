const blogService = require("../services/blogService");
const Comment = require("../models/commentModel");

async function listBlogs(req, res) {
  try {
    const { page = 1, search = "", tag = "" } = req.query;
    const result = await blogService.listPublishedBlogs({ page, search, tag });
    return res.json(result);
  } catch (error) {
    console.error("listBlogs error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function getBlog(req, res) {
  try {
    const blog = await blogService.getBlogById(req.params.id);

    // Only published blogs are visible to non-authors
    const isOwner = req.session.userId && String(blog.author._id) === String(req.session.userId);
    if (blog.status !== "published" && !isOwner && req.session.role !== "admin") {
      return res.status(404).json({ message: "Blog not found" });
    }

    const voteSummary = await blogService.getVoteSummary(req.params.id, req.session.userId);
    const commentCount = await Comment.countDocuments({ blog: req.params.id, parentComment: null });

    return res.json({ blog, voteSummary, commentCount });
  } catch (error) {
    if (error.message === "Blog not found") return res.status(404).json({ message: "Blog not found" });
    console.error("getBlog error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function createBlog(req, res) {
  try {
    const blog = await blogService.createBlog({
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      status: req.body.status,
      authorId: req.session.userId
    });
    return res.status(201).json({ blog });
  } catch (error) {
    if (error.message.includes("required")) {
      return res.status(400).json({ message: error.message });
    }
    console.error("createBlog error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function updateBlog(req, res) {
  try {
    const blog = await blogService.getBlogById(req.params.id);

    const isOwner = String(blog.author._id) === String(req.session.userId);
    if (!isOwner && req.session.role !== "admin") {
      return res.status(403).json({ message: "You can only edit your own blogs" });
    }

    const updated = await blogService.updateBlog(req.params.id, {
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      status: req.body.status
    });
    return res.json({ blog: updated });
  } catch (error) {
    if (error.message === "Blog not found") return res.status(404).json({ message: "Blog not found" });
    console.error("updateBlog error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function deleteBlog(req, res) {
  try {
    const blog = await blogService.getBlogById(req.params.id);

    const isOwner = String(blog.author._id) === String(req.session.userId);
    if (!isOwner && req.session.role !== "admin") {
      return res.status(403).json({ message: "You can only delete your own blogs" });
    }

    await blogService.deleteBlog(req.params.id);
    return res.json({ message: "Blog deleted" });
  } catch (error) {
    if (error.message === "Blog not found") return res.status(404).json({ message: "Blog not found" });
    console.error("deleteBlog error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function myBlogs(req, res) {
  try {
    const blogs = await blogService.listUserBlogs(req.session.userId);
    return res.json({ blogs });
  } catch (error) {
    console.error("myBlogs error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { listBlogs, getBlog, createBlog, updateBlog, deleteBlog, myBlogs };
