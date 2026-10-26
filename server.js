import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadStudentMatcher } from './student-roster.js';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const rosterDirectory = path.resolve(process.env.ROSTER_DIR || path.join(projectDirectory, 'private-roster'));
const maxBodyBytes = 4096;
const rateLimitWindowMs = 10 * 60 * 1000;
const maxAttemptsPerWindow = 100;
const verificationAttempts = new Map();
const paidEvents = new Map([
  ['tech-01', { title: 'DEVSprint', amount: 30000 }],
  ['tech-02', { title: 'BOTClash', amount: 50000 }],
  ['tech-03', { title: 'HackShield', amount: 15000 }],
  ['cult-03', { title: 'Stage Strike', amount: 35000 }],
  ['sport-01', { title: 'Moonlight Hoops', amount: 30000 }],
  ['sport-03', { title: 'Pixel Playoff', amount: 25000 }]
]);

const publicFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/css/style.css', ['css/style.css', 'text/css; charset=utf-8']],
  ['/js/events-data.js', ['js/events-data.js', 'text/javascript; charset=utf-8']],
  ['/js/main.js', ['js/main.js', 'text/javascript; charset=utf-8']],
  ['/js/story-dialogue.js', ['js/story-dialogue.js', 'text/javascript; charset=utf-8']],
  ['/js/three-scene.js', ['js/three-scene.js', 'text/javascript; charset=utf-8']],
  ['/assets/background-audio.mp3', ['assets/background-audio.mp3', 'audio/mpeg']],
  ['/background-audio.mp3', ['background-audio.mp3', 'audio/mpeg']]
]);

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(body));
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  if (origin === 'null') return true; // file:// origin
  try {
    const url = new URL(origin);
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return true;
    return url.host === request.headers.host;
  } catch {
    return false;
  }
}

function withinRateLimit(request) {
  const address = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let attempt = verificationAttempts.get(address);
  if (!attempt || attempt.resetAt <= now) {
    attempt = { count: 0, resetAt: now + rateLimitWindowMs };
    verificationAttempts.set(address, attempt);
  }
  attempt.count += 1;
  return attempt.count <= maxAttemptsPerWindow;
}

function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') && process.env.RAZORPAY_KEY_SECRET);
}

function razorpayHeaders() {
  const credentials = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' };
}

async function razorpayRequest(url, options = {}) {
  return fetch(`https://api.razorpay.com/v1${url}`, {
    ...options,
    headers: { ...razorpayHeaders(), ...options.headers }
  });
}

function validPaymentSignature(orderId, paymentId, signature) {
  if (typeof signature !== 'string' || !/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const actual = Buffer.from(signature, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error('Request too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function serveFile(response, urlPath) {
  const entry = publicFiles.get(urlPath);
  if (!entry) {
    response.writeHead(404, { 'Cache-Control': 'no-store' });
    response.end('Not found');
    return;
  }
  const [relativePath, contentType] = entry;
  const content = await readFile(path.join(projectDirectory, relativePath));
  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Length': content.length,
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  response.end(content);
}

async function createPortalServer() {
  const matcher = await loadStudentMatcher(rosterDirectory);
  console.info('Private student matcher loaded. Roster values are not logged.');

  return createServer(async (request, response) => {
    const urlPath = (request.url || '/').split('?')[0];
    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      });
      response.end();
      return;
    }

    if (urlPath === '/api/payment/order' || urlPath === '/api/payment/verify') {
      if (request.method !== 'POST') {
        sendJson(response, 405, { valid: false, message: 'Method not allowed.' });
        return;
      }
      if (!sameOrigin(request)) {
        sendJson(response, 403, { valid: false, message: 'Request origin was rejected.' });
        return;
      }
      if (!String(request.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
        sendJson(response, 415, { valid: false, message: 'JSON request required.' });
        return;
      }

      let body;
      try {
        body = await readJsonBody(request);
      } catch {
        sendJson(response, 400, { valid: false, message: 'Invalid payment request.' });
        return;
      }
      if (!razorpayConfigured()) {
        sendJson(response, 503, { valid: false, message: 'Razorpay test keys are not configured on the server.' });
        return;
      }

      if (urlPath === '/api/payment/order') {
        const event = paidEvents.get(body?.eventId);
        if (!event) {
          sendJson(response, 400, { valid: false, message: 'Unknown or free event.' });
          return;
        }
        try {
          const orderResponse = await razorpayRequest('/orders', {
            method: 'POST',
            body: JSON.stringify({
              amount: event.amount,
              currency: 'INR',
              receipt: `demo-${Date.now()}`,
              notes: { eventId: body.eventId }
            })
          });
          if (!orderResponse.ok) {
            let errorDetails = '';
            try {
              const payload = await orderResponse.json();
              const upstreamError = payload?.error;
              errorDetails = [upstreamError?.code, upstreamError?.description]
                .filter(value => typeof value === 'string' && value.length > 0)
                .join(': ');
            } catch {
              errorDetails = 'Razorpay returned an unreadable error response.';
            }
            console.error(`Razorpay order creation failed (HTTP ${orderResponse.status}): ${errorDetails || 'No error details returned.'}`);
            sendJson(response, 502, {
              valid: false,
              message: orderResponse.status === 401
                ? 'Razorpay rejected the test credentials. Check that the test key ID and secret are a matching pair.'
                : 'Razorpay rejected the order request. Check the server terminal for its error code and details.'
            });
            return;
          }
          const order = await orderResponse.json();
          sendJson(response, 200, {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
          });
        } catch (error) {
          console.error('Razorpay order request could not reach or parse the API response:', error.message);
          const errorCode = typeof error?.cause?.code === 'string'
            ? error.cause.code
            : error instanceof Error ? error.name : 'UnknownError';
          sendJson(response, 502, {
            valid: false,
            message: `Razorpay API request failed (${errorCode}). Check the server terminal for details.`
          });
        }
        return;
      }

      const event = paidEvents.get(body?.eventId);
      const { orderId, paymentId, signature } = body || {};
      if (!event || typeof orderId !== 'string' || typeof paymentId !== 'string' || !validPaymentSignature(orderId, paymentId, signature)) {
        sendJson(response, 400, { valid: false, message: 'Payment signature could not be verified.' });
        return;
      }
      try {
        const [orderResponse, paymentResponse] = await Promise.all([
          razorpayRequest(`/orders/${encodeURIComponent(orderId)}`),
          razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`)
        ]);
        if (!orderResponse.ok || !paymentResponse.ok) throw new Error('Razorpay payment lookup failed.');
        const [order, payment] = await Promise.all([orderResponse.json(), paymentResponse.json()]);
        const verified = order.notes?.eventId === body.eventId
          && order.amount === event.amount
          && order.currency === 'INR'
          && payment.order_id === orderId
          && payment.amount === event.amount
          && payment.currency === 'INR'
          && payment.status === 'captured';
        if (!verified) {
          sendJson(response, 409, { valid: false, message: 'Payment is not captured for this event yet.' });
          return;
        }
        sendJson(response, 200, { valid: true });
      } catch {
        sendJson(response, 502, { valid: false, message: 'Could not verify the Razorpay test payment.' });
      }
      return;
    }

    if (urlPath === '/api/verify-student') {
      if (request.method !== 'POST') {
        sendJson(response, 405, { valid: false, message: 'Method not allowed.' });
        return;
      }
      if (!sameOrigin(request)) {
        sendJson(response, 403, { valid: false, message: 'Request origin was rejected.' });
        return;
      }
      if (!withinRateLimit(request)) {
        sendJson(response, 429, { valid: false, message: 'Too many attempts. Try again later.' });
        return;
      }
      if (!String(request.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
        sendJson(response, 415, { valid: false, message: 'JSON request required.' });
        return;
      }

      try {
        const body = await readJsonBody(request);
        const isValid = matcher.matches({
          name: body?.name,
          roll: body?.roll,
          registrationNo: body?.registrationNo,
          email: body?.email
        });
        sendJson(response, 200, {
          valid: isValid,
          message: isValid
            ? 'Student details verified.'
            : 'Name, roll number, registration number, and email ID do not match. Check all four details and try again.'
        });
      } catch {
        sendJson(response, 400, { valid: false, message: 'Invalid verification request.' });
      }
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { 'Cache-Control': 'no-store' });
      response.end('Method not allowed');
      return;
    }
    try {
      await serveFile(response, urlPath);
    } catch {
      response.writeHead(404, { 'Cache-Control': 'no-store' });
      response.end('Not found');
    }
  });
}

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';

try {
  const server = await createPortalServer();
  server.listen(port, host, () => console.info(`Portal listening at http://${host}:${port}`));
} catch {
  console.error('Could not load the private student roster. Verification is disabled. Check the private roster files and restart.');
  process.exitCode = 1;
}