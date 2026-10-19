const fs = require('fs');
const https = require('https');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-node-7-2.json'), 'utf8'));
const node = data.nodes['7:2'].document;

console.log('Frame Name:', node.name);
console.log('Size:', node.absoluteBoundingBox);

function summarize(n, depth = 0) {
  const indent = '  '.repeat(depth);
  const bbox = n.absoluteBoundingBox || {};
  const style = n.style ? `[Font: ${n.style.fontFamily} ${n.style.fontWeight} ${n.style.fontSize}px]` : '';
  const characters = n.characters ? ` "${n.characters.replace(/\n/g, '\\n')}"` : '';
  console.log(`${indent}- [${n.type}] "${n.name}" (${Math.round(bbox.width || 0)}x${Math.round(bbox.height || 0)} at ${Math.round(bbox.x || 0)},${Math.round(bbox.y || 0)}) ${characters} ${style}`);
  if (n.children) {
    for (const c of n.children) {
      summarize(c, depth + 1);
    }
  }
}

summarize(node);

// Also download the rendered PNG from Figma S3 to inspect visually
const imgUrls = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-images.json'), 'utf8')).images;
const url = imgUrls['7:2'];
if (url) {
  const file = fs.createWriteStream(path.join(__dirname, 'figma-preview.png'));
  https.get(url, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      console.log('Downloaded figma-preview.png');
    });
  });
}
