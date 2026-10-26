const Blog = require("../models/blogModel");
const Comment = require("../models/commentModel");
const Vote = require("../models/voteModel");
const Report = require("../models/reportModel");

const PAGE_SIZE = 10;

/**
 * Derive a plain-text excerpt from HTML or plain content.
 * Strips tags, collapses whitespace, trims to 280 chars.
 */
function deriveExcerpt(content) {
  const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

/**
 * Create a new blog (defaults to draft).
 */
async function createBlog({ title, content, tags, status, authorId }) {
  if (!title || !title.trim()) throw new Error("Title is required");
  if (!content || !content.trim()) throw new Error("Content is required");

  const cleanTitle = title.trim().slice(0, 200);
  const cleanTags = Array.isArray(tags)
    ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 10)
    : [];

  const allowedStatus = status === "published" ? "published" : "draft";

  const blog = await Blog.create({
    title: cleanTitle,
    content: content.trim(),
    excerpt: deriveExcerpt(content),
    author: authorId,
    tags: cleanTags,
    status: allowedStatus,
    publishedAt: allowedStatus === "published" ? new Date() : null
  });

  return blog;
}

/**
 * Update an existing blog. Ownership is enforced by the caller.
 */
async function updateBlog(blogId, { title, content, tags, status }) {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error("Blog not found");

  if (title !== undefined) blog.title = title.trim().slice(0, 200);
  if (content !== undefined) {
    blog.content = content.trim();
    blog.excerpt = deriveExcerpt(content);
  }
  if (tags !== undefined) {
    blog.tags = Array.isArray(tags)
      ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 10)
      : [];
  }
  if (status === "published" && blog.status !== "published") {
    blog.status = "published";
    blog.publishedAt = new Date();
  } else if (status === "draft") {
    blog.status = "draft";
    blog.publishedAt = null;
  }

  await blog.save();
  return blog;
}

/**
 * Delete a blog and all dependent records.
 */
async function deleteBlog(blogId) {
  const blog = await Blog.findById(blogId);
  if (!blog) throw new Error("Blog not found");

  // Cascade: remove comments, votes, reports referencing this blog
  await Comment.deleteMany({ blog: blogId });
  await Vote.deleteMany({ blog: blogId });
  await Report.deleteMany({ target: blogId, targetType: "Blog" });

  // Also remove reports targeting comments of this blog (already deleted above,
  // but clean up any report records that may reference those comment IDs)
  // Comments are already deleted; their IDs no longer exist in DB.
  // Reports with targetType:"Comment" pointing to deleted comments are orphaned.
  // We handle this at report query time by tolerating null populate results.

  await Blog.findByIdAndDelete(blogId);
}

/**
 * List published blogs with optional search/tag/pagination.
 */
async function listPublishedBlogs({ page = 1, search = "", tag = "" } = {}) {
  const filter = { status: "published" };

  if (tag) {
    filter.tags = tag.toLowerCase();
  }

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }];
  }

  const skip = (Math.max(1, page) - 1) * PAGE_SIZE;
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate("author", "name")
      .lean(),
    Blog.countDocuments(filter)
  ]);

  return {
    blogs,
    page: Number(page),
    totalPages: Math.ceil(total / PAGE_SIZE),
    total
  };
}

/**
 * Get a single published blog by ID.
 */
async function getBlogById(blogId) {
  const blog = await Blog.findById(blogId).populate("author", "name email").lean();
  if (!blog) throw new Error("Blog not found");
  return blog;
}

/**
 * List blogs belonging to a specific author (includes drafts).
 */
async function listUserBlogs(authorId) {
  return Blog.find({ author: authorId }).sort({ updatedAt: -1 }).populate("author", "name").lean();
}

/**
 * Get vote counts for a blog and the requesting user's vote (if any).
 */
async function getVoteSummary(blogId, userId) {
  const [votes, userVote] = await Promise.all([
    Vote.aggregate([
      { $match: { blog: require("mongoose").Types.ObjectId.createFromHexString(blogId) } },
      { $group: { _id: "$value", count: { $sum: 1 } } }
    ]),
    userId ? Vote.findOne({ blog: blogId, user: userId }).lean() : null
  ]);

  let upvotes = 0;
  let downvotes = 0;
  for (const v of votes) {
    if (v._id === 1) upvotes = v.count;
    if (v._id === -1) downvotes = v.count;
  }

  return { upvotes, downvotes, userVote: userVote ? userVote.value : null };
}

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  listPublishedBlogs,
  getBlogById,
  listUserBlogs,
  getVoteSummary
};
