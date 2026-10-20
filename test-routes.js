const http = require('http');

const ROUTES = ['/', '/clock', '/weather', '/todo', '/news', '/style.css', '/scaler.js', '/figma-tokens.css', '/api/battery'];

async function testRoute(route) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          length: data.length,
          preview: data.slice(0, 80).replace(/\n/g, ' ')
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('[Test Suite] Verifying all routes...');
  let hasFailure = false;
  for (const route of ROUTES) {
    try {
      const res = await testRoute(route);
      const passed = res.status === 200 && res.length > 0;
      console.log(`${passed ? '✓' : '✗'} [${res.status}] ${route} (${res.contentType}) - ${res.length} bytes`);
      if (!passed) hasFailure = true;
    } catch (e) {
      console.error(`✗ Route ${route} failed with error:`, e.message);
      hasFailure = true;
    }
  }
  process.exit(hasFailure ? 1 : 0);
}

run();
