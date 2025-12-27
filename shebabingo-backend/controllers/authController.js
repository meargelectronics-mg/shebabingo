const bcrypt = require('bcrypt');
require('dotenv').config();

exports.adminLogin = (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'shebabingo@23';
  
  if (password === adminPassword) {
    const token = Buffer.from(adminPassword).toString('base64');
    
    res.json({
      success: true,
      token,
      message: 'Admin login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid admin password'
    });
  }
};

exports.verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const adminPassword = process.env.ADMIN_PASSWORD || 'shebabingo@23';
  const expectedToken = Buffer.from(adminPassword).toString('base64');
  
  if (token !== expectedToken) {
    return res.status(403).json({ error: 'Invalid admin token' });
  }
  
  next();
};