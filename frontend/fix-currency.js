const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
let changedCount = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let changed = false;
  const newLines = lines.map(line => {
    // Only replace ৳${ with ৳{ if the line DOES NOT contain a backtick
    if (line.includes('৳${') && !line.includes('`')) {
      changed = true;
      return line.replace(/৳\$\{/g, '৳{');
    }
    return line;
  });
  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'), 'utf8');
    changedCount++;
  }
});
console.log('Modified ' + changedCount + ' files.');
