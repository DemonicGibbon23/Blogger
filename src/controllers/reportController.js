const reportService = require("../services/reportService");

async function submitReport(req, res) {
  try {
    const report = await reportService.createReport({
      reporterId: req.session.userId,
      targetType: req.body.targetType,
      targetId: req.body.targetId,
      reason: req.body.reason
    });
    return res.status(201).json({ message: "Report submitted", report });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("not found") ||
      error.message.includes("already reported") ||
      error.message.includes("must be") ||
      error.message.includes("characters")
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("submitReport error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function listReports(req, res) {
  try {
    const { page = 1, status = "" } = req.query;
    const result = await reportService.listReports({ page, status });
    return res.json(result);
  } catch (error) {
    console.error("listReports error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function updateReportStatus(req, res) {
  try {
    const report = await reportService.updateReportStatus(req.params.id, req.body.status);
    return res.json({ report });
  } catch (error) {
    if (error.message.includes("Status must") || error.message.includes("not found")) {
      return res.status(400).json({ message: error.message });
    }
    console.error("updateReportStatus error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { submitReport, listReports, updateReportStatus };
