const express = require("express");
const blogController = require("../controllers/blogController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", blogController.listBlogs);
router.get("/:id", blogController.getBlog);

// Authenticated
router.get("/me/blogs", requireAuth, blogController.myBlogs);
router.post("/", requireAuth, blogController.createBlog);
router.put("/:id", requireAuth, blogController.updateBlog);
router.delete("/:id", requireAuth, blogController.deleteBlog);

module.exports = router;
