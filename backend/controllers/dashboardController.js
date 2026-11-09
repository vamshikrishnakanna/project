const Issue = require('../models/Issue');

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, underReview] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'Reported' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' }),
      Issue.countDocuments({ status: 'Under Review' }),
    ]);

    // Count potential duplicates (issues submitted forceSubmit after duplicate warning)
    const possibleDuplicates = await Issue.countDocuments({ isDuplicate: true });

    res.json({
      success: true,
      stats: { total, pending, inProgress, resolved, underReview, possibleDuplicates },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/dashboard/categories ───────────────────────────────────────────
exports.getCategoryStats = async (req, res) => {
  try {
    const data = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      categories: data.map((d) => ({ name: d._id, count: d.count })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/dashboard/status-distribution ───────────────────────────────────
exports.getStatusDistribution = async (req, res) => {
  try {
    const data = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      statuses: data.map((d) => ({ name: d._id, count: d.count })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/dashboard/recent ────────────────────────────────────────────────
exports.getRecentIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category status location createdAt image reporter');

    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

