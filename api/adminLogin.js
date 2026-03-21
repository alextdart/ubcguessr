const { createAdminToken } = require('./verifyAdmin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin access is not configured on this deployment.' });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  const token = createAdminToken();
  return res.status(200).json({ token });
};
