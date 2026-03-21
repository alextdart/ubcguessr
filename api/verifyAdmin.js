const crypto = require('crypto');

function createAdminToken() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD not configured');

  const payload = JSON.stringify({ exp: Date.now() + 24 * 60 * 60 * 1000 });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  return `${payloadB64}.${signature}`;
}

function verifyAdminToken(token) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

module.exports = { createAdminToken, verifyAdminToken };
