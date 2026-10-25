
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
    {
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog",
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        value: {
            type: Number,
            enum: [1, -1],
            required: true
        }
    },
    {
        timestamps: true
    }
);

//one vote for a user in a blog
voteSchema.index(
    { blog: 1, user: 1 },
    { unique: true }
);

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
