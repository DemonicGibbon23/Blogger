
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000
        },

        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
