const express = require("express");
const reportController = require("../controllers/reportController");
const { requireAuth, requireAdmin, rateLimiter } = require("../middleware/authMiddleware");

const router = express.Router();


const reportRateLimit = rateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });
router.post("/", requireAuth, reportRateLimit, reportController.submitReport);

// Admin-only
router.get("/", requireAuth, requireAdmin, reportController.listReports);
router.patch("/:id/status", requireAuth, requireAdmin, reportController.updateReportStatus);

module.exports = router;
