require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const { Admin, Newspaper, RecentNews } = require('./models');
const driveService = require('./driveService');
const authMiddleware = require('./authMiddleware');

const app = express();

// Trust reverse proxy (e.g. Vercel, Heroku) for accurate IP assignment in rate limiter
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Dynamic CORS — reads FRONTEND_URL from env + allows localhost for dev + Vercel previews
const allowedOrigins = [
  "http://localhost:3000",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview URL for this project
    if (origin.match(/^https:\/\/.*\.vercel\.app$/)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('फक्त PDF, JPG, JPEG, PNG फाईल्स स्वीकारल्या जातात.'));
    }
  }
});


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize default admin on startup
const initializeAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await Admin.create({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Admin'
      });
      console.log('✅ Default admin created');
    }
  } catch (error) {
    console.error('❌ Admin initialization error:', error);
  }
};

initializeAdmin();

// ==================== PUBLIC ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// Get today's newspapers (IST timezone)
app.get('/api/newspaper/today', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD in IST
    const newspapers = await Newspaper.find({ date: today }).sort({ uploadedAt: -1 });
    
    if (!newspapers.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'आजचे वर्तमानपत्र अजून उपलब्ध नाही.' 
      });
    }

    res.json({ success: true, data: newspapers });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Get latest newspaper (most recent upload)
app.get('/api/newspaper/latest', async (req, res) => {
  try {
    const newspaper = await Newspaper.findOne().sort({ uploadedAt: -1 });
    
    if (!newspaper) {
      return res.status(404).json({ 
        success: false, 
        message: 'कोणतेही वर्तमानपत्र उपलब्ध नाही.' 
      });
    }

    res.json({ success: true, data: newspaper });
  } catch (error) {
    console.error('Get latest error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Get newspapers by date (returns array)
app.get('/api/newspaper/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        success: false, 
        message: 'अवैध तारीख स्वरूप. YYYY-MM-DD वापरा.' 
      });
    }

    const newspapers = await Newspaper.find({ date }).sort({ uploadedAt: -1 });
    
    if (!newspapers.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'या तारखेसाठी वर्तमानपत्र उपलब्ध नाही.' 
      });
    }

    res.json({ success: true, data: newspapers });
  } catch (error) {
    console.error('Get by date error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Get all newspapers (with pagination)
app.get('/api/newspaper/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const newspapers = await Newspaper.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Newspaper.countDocuments();

    res.json({ 
      success: true, 
      data: newspapers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Get newspapers by month
app.get('/api/newspaper/month/:yearMonth', async (req, res) => {
  try {
    const { yearMonth } = req.params; // Format: YYYY-MM
    
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      return res.status(400).json({ 
        success: false, 
        message: 'अवैध महिना स्वरूप. YYYY-MM वापरा.' 
      });
    }

    const newspapers = await Newspaper.find({
      date: { $regex: `^${yearMonth}` }
    }).sort({ date: -1 });

    res.json({ success: true, data: newspapers, count: newspapers.length });
  } catch (error) {
    console.error('Get by month error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// ==================== ADMIN AUTH ROUTES ====================

// Admin login
app.post('/api/admin/login', [
  body('email').isEmail().withMessage('वैध ईमेल आवश्यक आहे'),
  body('password').notEmpty().withMessage('पासवर्ड आवश्यक आहे')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'चुकीचा ईमेल किंवा पासवर्ड' 
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'चुकीचा ईमेल किंवा पासवर्ड' 
      });
    }

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, tokenVersion: admin.tokenVersion || 0 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Verify token
app.get('/api/admin/verify', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'अ‍ॅडमिन सापडला नाही' });
    }
    res.json({ success: true, admin });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// ==================== ADMIN PROTECTED ROUTES ====================

// Upload newspaper (always appends, never overwrites)
app.post('/api/admin/newspaper/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'कृपया फाईल अपलोड करा' 
      });
    }

    const { date } = req.body;
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        success: false, 
        message: 'वैध तारीख आवश्यक आहे (YYYY-MM-DD)' 
      });
    }

    // Get file extension and create a unique filename
    const fileExt = req.file.mimetype.split('/')[1];
    const timestamp = Date.now();
    const fileName = `${date}_${timestamp}.${fileExt}`;

    // Upload to Google Drive
    const driveFile = await driveService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    // Always create a new record (multiple papers per day)
    const newspaper = await Newspaper.create({
      date,
      driveFileId: driveFile.id,
      fileName: driveFile.name,
      originalFileName: req.file.originalname,
      fileType: fileExt,
      previewUrl: driveService.getPreviewUrl(driveFile.id),
      directDownloadUrl: driveService.getDownloadUrl(driveFile.id),
      fileSize: parseInt(driveFile.size),
      uploadedBy: req.adminId
    });

    res.json({ 
      success: true, 
      message: 'वर्तमानपत्र यशस्वीरित्या अपलोड केले', 
      data: newspaper 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'अपलोड करताना त्रुटी झाली' 
    });
  }
});

// Delete newspaper
app.delete('/api/admin/newspaper/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const newspaper = await Newspaper.findById(id);
    if (!newspaper) {
      return res.status(404).json({ 
        success: false, 
        message: 'वर्तमानपत्र सापडले नाही' 
      });
    }

    // Delete from Google Drive
    await driveService.deleteFile(newspaper.driveFileId);

    // Delete from database
    await Newspaper.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'वर्तमानपत्र यशस्वीरित्या हटवले' 
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'हटवताना त्रुटी झाली' 
    });
  }
});

// Get upload history (admin)
app.get('/api/admin/newspaper/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const newspapers = await Newspaper.find()
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const total = await Newspaper.countDocuments();

    res.json({ 
      success: true, 
      data: newspapers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Change password
app.post('/api/admin/change-password', authMiddleware, [
  body('currentPassword').notEmpty().withMessage('सध्याचा पासवर्ड आवश्यक आहे'),
  body('newPassword').isLength({ min: 6 }).withMessage('नवीन पासवर्ड किमान 6 वर्ण असावा')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.adminId);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'सध्याचा पासवर्ड चुकीचा आहे' 
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.tokenVersion = (admin.tokenVersion || 0) + 1; // Invalidate current tokens
    await admin.save();

    res.json({ 
      success: true, 
      message: 'पासवर्ड यशस्वीरित्या बदलला' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// ==================== NEWS ROUTES (PUBLIC) ====================

// Get latest news
app.get('/api/news/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const news = await RecentNews.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-__v');
    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Get latest news error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Get single news by ID
app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await RecentNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'बातमी सापडली नाही' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// ==================== ADMIN NEWS ROUTES ====================

// Get all news (admin)
app.get('/api/admin/news/all', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const news = await RecentNews.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const total = await RecentNews.countDocuments();

    res.json({ 
      success: true, 
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ success: false, message: 'सर्व्हर त्रुटी' });
  }
});

// Create news (admin)
app.post('/api/admin/news/create', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title_mr, title_en, description_mr, description_en } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'कृपया प्रतिमा अपलोड करा' });
    }

    const fileExt = req.file.mimetype.split('/')[1];
    const fileName = `news_${Date.now()}.${fileExt}`;

    const driveFile = await driveService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    const news = await RecentNews.create({
      title_mr,
      title_en,
      description_mr,
      description_en,
      imageUrl: driveService.getPreviewUrl(driveFile.id),
      driveFileId: driveFile.id,
      uploadedBy: req.adminId
    });

    res.json({ success: true, message: 'बातमी यशस्वीरित्या प्रकाशित केली', data: news });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ success: false, message: error.message || 'बातमी प्रकाशित करताना त्रुटी' });
  }
});

// Update news (admin)
app.put('/api/admin/news/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title_mr, title_en, description_mr, description_en } = req.body;
    const news = await RecentNews.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'बातमी सापडली नाही' });
    }

    news.title_mr = title_mr;
    news.title_en = title_en;
    news.description_mr = description_mr;
    news.description_en = description_en;

    if (req.file) {
      try {
        await driveService.deleteFile(news.driveFileId);
      } catch (err) {
        console.error('Failed to delete old image:', err);
      }

      const fileExt = req.file.mimetype.split('/')[1];
      const fileName = `news_${Date.now()}.${fileExt}`;

      const driveFile = await driveService.uploadFile(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );

      news.imageUrl = driveService.getPreviewUrl(driveFile.id);
      news.driveFileId = driveFile.id;
    }

    await news.save();

    res.json({ success: true, message: 'बातमी यशस्वीरित्या अपडेट केली', data: news });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ success: false, message: 'अपडेट करताना त्रुटी' });
  }
});

// Delete news (admin)
app.delete('/api/admin/news/:id', authMiddleware, async (req, res) => {
  try {
    const news = await RecentNews.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({ success: false, message: 'बातमी सापडली नाही' });
    }

    try {
      await driveService.deleteFile(news.driveFileId);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }

    await RecentNews.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'बातमी यशस्वीरित्या हटवली' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ success: false, message: 'हटवताना त्रुटी' });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'मार्ग सापडला नाही' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const isProduction = process.env.NODE_ENV === 'production';
  const errorMessage = isProduction ? 'अंतर्गत सर्व्हर त्रुटी' : (err.message || 'अंतर्गत सर्व्हर त्रुटी');

  res.status(500).json({ 
    success: false, 
    message: errorMessage 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL}`);
});
