const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const match = envContent.match(/FIGMA_TOKEN=(.*)/);
const token = match ? match[1].trim() : '';

const fileKey = 'XqyL5btLQpbWppgUfk7pmV';
const nodeId = '7:2'; // 7-2 -> 7:2 in API

function figmaApi(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.figma.com/v1${endpoint}`, {
      headers: {
        'X-Figma-Token': token
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching node data for node 7:2 from Figma...');
  const res = await figmaApi(`/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`);
  fs.writeFileSync(path.join(__dirname, 'figma-node-7-2.json'), JSON.stringify(res, null, 2));
  console.log('Saved figma-node-7-2.json');

  // Let's also check images/export for node 7:2 (as png or svg)
  const imageRes = await figmaApi(`/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=1`);
  console.log('Image render URL:', imageRes);
  fs.writeFileSync(path.join(__dirname, 'figma-images.json'), JSON.stringify(imageRes, null, 2));
}

run().catch(console.error);
