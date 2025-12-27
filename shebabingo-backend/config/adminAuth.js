require('dotenv').config();

const requireAdmin = (req, res, next) => {
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

module.exports = { requireAdmin };