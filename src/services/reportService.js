const Report = require("../models/reportModel");
const Blog = require("../models/blogModel");
const Comment = require("../models/commentModel");

const VALID_REASONS = ["spam", "harassment", "misinformation", "inappropriate content", "other"];
const PAGE_SIZE = 20;


async function createReport({ reporterId, targetType, targetId, reason }) {
  if (!["Blog", "Comment"].includes(targetType)) {
    throw new Error("targetType must be Blog or Comment");
  }

  if (!reason || !reason.trim()) throw new Error("Reason is required");
  if (reason.trim().length > 1000) throw new Error("Reason must be 1000 characters or fewer");

  
  const TargetModel = targetType === "Blog" ? Blog : Comment;
  const target = await TargetModel.findById(targetId);
  if (!target) throw new Error(`${targetType} not found`);

  
  const existing = await Report.findOne({
    reporter: reporterId,
    target: targetId,
    targetType
  });
  if (existing) throw new Error("You have already reported this content");

  const report = await Report.create({
    reporter: reporterId,
    targetType,
    target: targetId,
    reason: reason.trim()
  });

  return report;
}


async function listReports({ page = 1, status = "" } = {}) {
  const filter = {};
  if (status && ["pending", "reviewed", "resolved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const skip = (Math.max(1, page) - 1) * PAGE_SIZE;
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate("reporter", "name email")
      .lean(),
    Report.countDocuments(filter)
  ]);

  return {
    reports,
    page: Number(page),
    totalPages: Math.ceil(total / PAGE_SIZE),
    total
  };
}


async function updateReportStatus(reportId, status) {
  const allowed = ["reviewed", "resolved", "rejected"];
  if (!allowed.includes(status)) {
    throw new Error(`Status must be one of: ${allowed.join(", ")}`);
  }

  const report = await Report.findByIdAndUpdate(
    reportId,
    { status },
    { new: true }
  );
  if (!report) throw new Error("Report not found");
  return report;
}

module.exports = { createReport, listReports, updateReportStatus };
