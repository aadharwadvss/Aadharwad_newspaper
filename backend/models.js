const mongoose = require('mongoose');

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Admin'
  },
  tokenVersion: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Newspaper Schema
const newspaperSchema = new mongoose.Schema({
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  driveFileId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'jpg', 'jpeg', 'png'],
    required: true
  },
  previewUrl: {
    type: String,
    required: true
  },
  directDownloadUrl: {
    type: String
  },
  fileSize: {
    type: Number // in bytes
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
newspaperSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Recent News Schema
const recentNewsSchema = new mongoose.Schema({
  title_mr: {
    type: String,
    required: true
  },
  title_en: {
    type: String,
    required: true
  },
  description_mr: {
    type: String,
    required: true
  },
  description_en: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  driveFileId: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

recentNewsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Admin = mongoose.model('Admin', adminSchema);
const Newspaper = mongoose.model('Newspaper', newspaperSchema);
const RecentNews = mongoose.model('RecentNews', recentNewsSchema);

// Drop the old unique index on 'date' if it exists (allows multiple papers per day)
Newspaper.collection.dropIndex('date_1').catch(() => {
  // Index may not exist, ignore error
});

module.exports = { Admin, Newspaper, RecentNews };
