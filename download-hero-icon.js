const fs = require('fs');
const https = require('https');
const path = require('path');

const node72 = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-node-7-2.json'), 'utf8')).nodes['7:2'].document;

let imageFillId = null;
function findImg(n) {
  if (n.name === 'image 9' && n.fills) {
    n.fills.forEach(f => {
      if (f.type === 'IMAGE') imageFillId = f.imageRef;
    });
  }
  if (n.children) n.children.forEach(findImg);
}
findImg(node72);
console.log('image 9 imageRef:', imageFillId);

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const token = envContent.match(/FIGMA_TOKEN=(.*)/)[1].trim();

https.get(`https://api.figma.com/v1/files/XqyL5btLQpbWppgUfk7pmV/images`, {
  headers: { 'X-Figma-Token': token }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const imgUrl = json.meta.images[imageFillId];
    console.log('Image URL for hero icon:', imgUrl);
    if (imgUrl) {
      const file = fs.createWriteStream(path.join(__dirname, 'public', 'figma-assets', 'hero-weather-icon.png'));
      https.get(imgUrl, (imgRes) => {
        imgRes.pipe(file);
        file.on('finish', () => console.log('Downloaded hero-weather-icon.png successfully!'));
      });
    }
  });
});
