const Issue = require('../models/Issue');
const { findDuplicates } = require('../services/duplicateDetector');
const path = require('path');
const fs = require('fs');

// ─── POST /api/issues ─────────────────────────────────────────────────────────
exports.createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      area,
      city,
      reporterName,
      reporterContact,
      forceSubmit,
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const issueData = {
      title: title?.trim(),
      description: description?.trim(),
      category,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address?.trim() || '',
        area: area?.trim() || '',
        city: city?.trim() || 'Bengaluru',
      },
      reporter: {
        name: reporterName?.trim() || 'Anonymous',
        contact: reporterContact?.trim() || null,
      },
    };

    // Handle image upload
    if (req.file) {
      issueData.image = {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      };
    }

    // Check for duplicates unless user forces submit
    if (!forceSubmit || forceSubmit === 'false') {
      const duplicates = await findDuplicates(issueData);
      if (duplicates.length > 0) {
        return res.status(200).json({
          success: true,
          isDuplicate: true,
          message: 'Possible duplicate issues found',
          duplicates: duplicates.map((d) => ({
            issue: d.issue,
            scores: d.scores,
            distance: d.distance,
          })),
        });
      }
    }

    const issue = await Issue.create(issueData);

    res.status(201).json({
      success: true,
      isDuplicate: false,
      message: 'Issue reported successfully',
      issue,
    });
  } catch (error) {
    console.error('createIssue error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/issues ──────────────────────────────────────────────────────────
exports.getIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      city,
    } = req.query;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.area': new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const [issues, total] = await Promise.all([
      Issue.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Issue.countDocuments(filter),
    ]);

    res.json({
      success: true,
      issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/issues/map ──────────────────────────────────────────────────────
exports.getIssuesForMap = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;

    const issues = await Issue.find(filter)
      .select('title category status location image createdAt')
      .limit(500);

    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/issues/:id ──────────────────────────────────────────────────────
exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('duplicateOf');
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Find related issues (same category, nearby)
    const related = await Issue.find({
      _id: { $ne: issue._id },
      category: issue.category,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: issue.location.coordinates },
          $maxDistance: 2000,
        },
      },
    })
      .select('title category status location createdAt image')
      .limit(4);

    res.json({ success: true, issue, related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/issues/:id/status ─────────────────────────────────────────────
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Reported', 'Under Review', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    res.json({ success: true, message: 'Status updated', issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/issues/:id ───────────────────────────────────────────────────
exports.deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    // Delete associated image file if exists
    if (issue.image?.filename) {
      const filePath = path.join(__dirname, '..', 'uploads', issue.image.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await issue.deleteOne();
    res.json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/issues/check-duplicate ─────────────────────────────────────────
exports.checkDuplicate = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.query;
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'All fields required for duplicate check' });
    }

    const issueData = {
      title,
      description,
      category,
      location: { coordinates: [parseFloat(longitude), parseFloat(latitude)] },
    };

    const duplicates = await findDuplicates(issueData);

    res.json({
      success: true,
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates.map((d) => ({
        issue: d.issue,
        scores: d.scores,
        distance: d.distance,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── POST /api/issues/:id/upvote ──────────────────────────────────────────────
exports.upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { returnDocument: 'after' }
    );
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.json({ success: true, message: 'Upvoted successfully', upvotes: issue.upvotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
