// Generate a HS256 JWT without external dependencies using Node's crypto.
import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || "c0c8e48b2412f371baf7709ad38b2f3f5720a3cb604518d4e718a8cb55c987db";

function base64url(input: string | Buffer) {
	const b = typeof input === 'string' ? Buffer.from(input) : input;
	return b.toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const header = { alg: 'HS256', typ: 'JWT' };
const now = Math.floor(Date.now() / 1000);
const payload = { id: 'admin-local', email: 'admin@local', role: 'admin', iat: now, exp: now + 7 * 24 * 3600 };

const headerB64 = base64url(JSON.stringify(header));
const payloadB64 = base64url(JSON.stringify(payload));
const data = `${headerB64}.${payloadB64}`;
const signature = crypto.createHmac('sha256', SECRET).update(data).digest();
const sigB64 = base64url(signature);
console.log(`${data}.${sigB64}`);
