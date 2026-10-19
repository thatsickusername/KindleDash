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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-node-7-2.json'), 'utf8'));
  const root = data.nodes['7:2'].document;

  const vectorNodes = [];
  function findNodes(n) {
    if (n.name === 'image 9' || n.name === 'SVG' || n.type === 'VECTOR') {
      vectorNodes.push({ id: n.id, name: n.name, type: n.type });
    }
    if (n.children) n.children.forEach(findNodes);
  }
  findNodes(root);
  console.log('Found nodes for export:', vectorNodes);

  // Let's export them as SVG from Figma
  const ids = vectorNodes.map(v => v.id).join(',');
  const svgRes = await figmaApi(`/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=svg`);
  console.log('SVG URLs:', svgRes);

  const outDir = path.join(__dirname, 'public', 'figma-assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const item of vectorNodes) {
    const url = svgRes.images[item.id];
    if (url) {
      const svgCode = await fetchUrl(url);
      const safeName = `${item.id.replace(':', '_')}_${item.name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
      fs.writeFileSync(path.join(outDir, safeName), svgCode);
      console.log(`Saved ${safeName}`);
    }
  }

  // Also check if "image 9" is an image fill in Figma
  const imageFillsRes = await figmaApi(`/files/${fileKey}/images`);
  console.log('Image fills:', imageFillsRes);
}

run().catch(console.error);
