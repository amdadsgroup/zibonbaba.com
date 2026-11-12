const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
};

const frontendDir = path.join(__dirname, '../frontend/src');
const files = walk(frontendDir);

console.log(`🔍 Scanning ${files.length} frontend files for price formatting issues...`);

const patterns = [
  /\$\{\s*(p|product|item|cart|total|amount|balance|subtotal|v|variant)\.(price|total|amount|balance|subtotal)/i,
  /\$\s*\{\s*(price|total|amount|balance|subtotal)/i,
  />\s*\$\s*\{/i
];

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      if (pattern.test(line)) {
        console.log(`📍 Found in: ${path.relative(frontendDir, file)}:L${index + 1}`);
        console.log(`   Line: ${line.trim()}`);
      }
    });
  });
});
