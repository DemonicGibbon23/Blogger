const voteService = require("../services/voteService");

async function vote(req, res) {
  try {
    const value = Number(req.body.value);
    const result = await voteService.castVote({
      blogId: req.params.blogId,
      userId: req.session.userId,
      value
    });
    return res.json(result);
  } catch (error) {
    if (
      error.message.includes("1 or -1") ||
      error.message.includes("not found") ||
      error.message.includes("own blog")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("vote error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { vote };
