const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    content: {
      type: String,
      required: true
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tags: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },

    publishedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Efficient queries for published feed
blogSchema.index({ status: 1, publishedAt: -1 });
// Tag filtering
blogSchema.index({ tags: 1, status: 1 });
// Author's own blogs
blogSchema.index({ author: 1, status: 1 });

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
