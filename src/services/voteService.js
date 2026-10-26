const Vote = require("../models/voteModel");
const Blog = require("../models/blogModel");


async function castVote({ blogId, userId, value }) {
  if (value !== 1 && value !== -1) throw new Error("Vote value must be 1 or -1");

  const blog = await Blog.findById(blogId);
  if (!blog || blog.status !== "published") throw new Error("Blog not found");

  
  if (String(blog.author) === String(userId)) {
    throw new Error("You cannot vote on your own blog");
  }

  const existing = await Vote.findOne({ blog: blogId, user: userId });

  let userVote = null;

  if (existing) {
    if (existing.value === value) {
      
      await Vote.findByIdAndDelete(existing._id);
      userVote = null;
    } else {
      
      existing.value = value;
      await existing.save();
      userVote = value;
    }
  } else {
    await Vote.create({ blog: blogId, user: userId, value });
    userVote = value;
  }

  
  const votes = await Vote.aggregate([
    { $match: { blog: require("mongoose").Types.ObjectId.createFromHexString(String(blogId)) } },
    { $group: { _id: "$value", count: { $sum: 1 } } }
  ]);

  let upvotes = 0;
  let downvotes = 0;
  for (const v of votes) {
    if (v._id === 1) upvotes = v.count;
    if (v._id === -1) downvotes = v.count;
  }

  return { upvotes, downvotes, userVote };
}

module.exports = { castVote };
