const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const Comment = require("../models/commentModel");
const Vote = require("../models/voteModel");
const Report = require("../models/reportModel");

/**
 * Get a public user profile and their published blogs.
 */
async function getUserProfile(userId) {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Update the authenticated user's own profile (name and/or bio only).
 */
async function updateProfile(userId, { name, bio }) {
  const update = {};
  if (name !== undefined) {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Name cannot be empty");
    if (cleanName.length > 100) throw new Error("Name must be 100 characters or fewer");
    update.name = cleanName;
  }
  if (bio !== undefined) {
    update.bio = bio.trim().slice(0, 500);
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Delete a user account and all their content (cascade).
 * Called by admin or the user themselves.
 */
async function deleteUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Delete user's blogs (and their comments/votes/reports via blog cascade is not auto — do it here)
  const blogs = await Blog.find({ author: userId }).select("_id").lean();
  const blogIds = blogs.map((b) => b._id);

  await Comment.deleteMany({ blog: { $in: blogIds } });
  await Vote.deleteMany({ blog: { $in: blogIds } });
  await Report.deleteMany({ target: { $in: blogIds }, targetType: "Blog" });
  await Blog.deleteMany({ author: userId });

  // Delete user's comments and their sub-reports
  const comments = await Comment.find({ author: userId }).select("_id").lean();
  const commentIds = comments.map((c) => c._id);
  await Report.deleteMany({ target: { $in: commentIds }, targetType: "Comment" });
  await Comment.deleteMany({ author: userId });

  // Delete votes and reports by the user
  await Vote.deleteMany({ user: userId });
  await Report.deleteMany({ reporter: userId });

  await User.findByIdAndDelete(userId);
}

/**
 * Admin: list all users.
 */
async function listUsers({ page = 1 } = {}) {
  const PAGE_SIZE = 20;
  const skip = (Math.max(1, page) - 1) * PAGE_SIZE;
  const [users, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
    User.countDocuments()
  ]);
  return { users, page: Number(page), totalPages: Math.ceil(total / PAGE_SIZE), total };
}

module.exports = { getUserProfile, updateProfile, deleteUser, listUsers };
