const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Simple authentication
    const password = req.query.password;
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // If it's a login request, just return success
    if (req.url.includes('/admin/login')) {
      return res.status(200).json({ success: true });
    }

    // For the main admin page, serve the HTML file
    const adminHtmlPath = path.join(process.cwd(), 'public', 'admin.html');
    
    // Check if file exists
    if (!fs.existsSync(adminHtmlPath)) {
      return res.status(404).json({ error: 'Admin page not found' });
    }

    // Read and serve the HTML file
    const htmlContent = fs.readFileSync(adminHtmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlContent);

  } catch (error) {
    console.error('Admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};