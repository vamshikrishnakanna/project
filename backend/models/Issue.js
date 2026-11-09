const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Pothole',
        'Garbage',
        'Streetlight',
        'Water Leakage',
        'Drainage',
        'Road Damage',
        'Traffic Sign Damage',
        'Other',
      ],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function (v) {
            return (
              Array.isArray(v) &&
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: 'Invalid coordinates. Must be [longitude, latitude]',
        },
      },
      address: {
        type: String,
        trim: true,
        maxlength: [300, 'Address cannot exceed 300 characters'],
      },
      city: {
        type: String,
        trim: true,
        default: 'Bengaluru',
      },
      area: {
        type: String,
        trim: true,
      },
    },
    image: {
      url: { type: String, default: null },
      filename: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ['Reported', 'Under Review', 'In Progress', 'Resolved'],
      default: 'Reported',
    },
    reporter: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
        default: 'Anonymous',
      },
      contact: {
        type: String,
        trim: true,
        maxlength: [100, 'Contact cannot exceed 100 characters'],
        default: null,
      },
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateScore: {
      type: Number,
      default: null,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2dsphere geospatial index
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ category: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text' });

// Virtual for complaint ID display
issueSchema.virtual('complaintId').get(function () {
  return `CT-${this._id.toString().slice(-6).toUpperCase()}`;
});

module.exports = mongoose.model('Issue', issueSchema);

