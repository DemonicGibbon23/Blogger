const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlenght: 200
    },

    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      trime: true,
      maxlenght: 300,
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
    },

    timestamps: true

  }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
