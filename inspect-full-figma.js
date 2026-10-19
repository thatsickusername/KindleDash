const fs = require('fs');
const https = require('https');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const match = envContent.match(/FIGMA_TOKEN=(.*)/);
const token = match ? match[1].trim() : '';
const fileKey = 'XqyL5btLQpbWppgUfk7pmV';

function figmaApi(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.figma.com/v1${endpoint}`, {
      headers: { 'X-Figma-Token': token }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const res = await figmaApi(`/files/${fileKey}`);
  fs.writeFileSync(path.join(__dirname, 'figma-full-file.json'), JSON.stringify(res, null, 2));
  console.log('Document pages:');
  res.document.children.forEach(page => {
    console.log(`Page: ${page.name}`);
    page.children.forEach(frame => {
      console.log(`  Frame: ${frame.name} (${frame.id})`);
    });
  });
}

run().catch(console.error);
