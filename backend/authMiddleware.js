const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'प्रवेश नाकारला. कृपया लॉगिन करा.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    req.email = decoded.email;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'तुमचा सत्र संपला आहे. कृपया पुन्हा लॉगिन करा.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'अवैध टोकन. कृपया पुन्हा लॉगिन करा.' 
    });
  }
};

module.exports = authMiddleware;
