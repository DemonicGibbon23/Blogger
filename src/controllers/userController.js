const userService = require("../services/userService");
const blogService = require("../services/blogService");

async function getProfile(req, res) {
  try {
    const user = await userService.getUserProfile(req.params.id);
    const blogs = await blogService.listUserBlogs(req.params.id);
    // Only published blogs visible to other users
    const isOwnerOrAdmin =
      (req.session.userId && String(req.session.userId) === String(req.params.id)) ||
      req.session.role === "admin";
    const visibleBlogs = isOwnerOrAdmin
      ? blogs
      : blogs.filter((b) => b.status === "published");
    return res.json({ user, blogs: visibleBlogs });
  } catch (error) {
    if (error.message === "User not found") return res.status(404).json({ message: "User not found" });
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await userService.updateProfile(req.session.userId, {
      name: req.body.name,
      bio: req.body.bio
    });
    return res.json({ user });
  } catch (error) {
    if (error.message.includes("empty") || error.message.includes("characters")) {
      return res.status(400).json({ message: error.message });
    }
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function deleteUser(req, res) {
  try {
    const targetId = req.params.id;
    const isOwner = String(req.session.userId) === String(targetId);

    if (!isOwner && req.session.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await userService.deleteUser(targetId);
    req.session.destroy(() => {});
    return res.json({ message: "Account deleted" });
  } catch (error) {
    if (error.message === "User not found") return res.status(404).json({ message: "User not found" });
    console.error("deleteUser error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function listUsers(req, res) {
  try {
    const { page = 1 } = req.query;
    const result = await userService.listUsers({ page });
    return res.json(result);
  } catch (error) {
    console.error("listUsers error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { getProfile, updateProfile, deleteUser, listUsers };
