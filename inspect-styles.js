const fs = require('fs');
const path = require('path');

const full = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-full-file.json'), 'utf8'));
const node72 = JSON.parse(fs.readFileSync(path.join(__dirname, 'figma-node-7-2.json'), 'utf8')).nodes['7:2'].document;

console.log('--- Frame 1 (7:2) Full Tree ---');

function inspectNode(node, depth = 0) {
  const indent = '  '.repeat(depth);
  const bbox = node.absoluteBoundingBox ? `${Math.round(node.absoluteBoundingBox.width)}x${Math.round(node.absoluteBoundingBox.height)} @ (${Math.round(node.absoluteBoundingBox.x)}, ${Math.round(node.absoluteBoundingBox.y)})` : '';
  const fills = node.fills ? JSON.stringify(node.fills.map(f => f.type + (f.color ? ` rgba(${f.color.r},${f.color.g},${f.color.b},${f.color.a})` : ''))) : '';
  const strokes = node.strokes ? JSON.stringify(node.strokes.map(s => s.type + (s.color ? ` rgba(${s.color.r},${s.color.g},${s.color.b},${s.color.a})` : ''))) : '';
  const corner = node.cornerRadius !== undefined ? `radius: ${node.cornerRadius}` : '';
  console.log(`${indent}${node.name} [${node.type}] ${bbox} ${corner} fills:${fills} strokes:${strokes}`);
  if (node.style) {
    console.log(`${indent}  STYLE: font=${node.style.fontFamily} wt=${node.style.fontWeight} sz=${node.style.fontSize} lineH=${node.style.lineHeightPx} letterSp=${node.style.letterSpacing}`);
  }
  if (node.children) {
    node.children.forEach(c => inspectNode(c, depth + 1));
  }
}

inspectNode(node72);
