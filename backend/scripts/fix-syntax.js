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

console.log(`🔧 Scanning ${files.length} files to resolve template literal syntax errors...`);

let fixedFiles = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Let's identify lines with "৳{"
  if (content.includes('৳{')) {
    // We want to process each occurrence of "৳{"
    // If it's a money variable, replace with "৳${"
    // Otherwise, replace with "${"
    
    // Split into lines or perform global regex replacement with a matcher function
    content = content.replace(/৳{([^}]+)}/g, (match, expression) => {
      const expr = expression.trim();
      // List of keywords that represent currency / prices
      const isMoney = /price|total|amount|balance|subtotal|sales|payout|tax|shipping|grandTotal/i.test(expr);
      
      if (isMoney) {
        return `৳\$\{${expression}\}`;
      } else {
        return `\$\{${expression}\}`;
      }
    });

    // Also check for specific cases: e.g. class names or inline expressions with backslashes
    // like className={`... ৳{sidebarOpen ...}`} -> `${sidebarOpen}`
    // `৳{role.color}` -> `${role.color}`
    // `৳{link.color}` -> `${link.color}`
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Corrected template expression syntax in: ${path.relative(frontendDir, file)}`);
      fixedFiles++;
    }
  }
});

console.log(`🎉 Completed syntax checks! Fixed ${fixedFiles} files.`);
