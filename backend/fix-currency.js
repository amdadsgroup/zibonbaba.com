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

console.log(`🔨 Beginning automated currency prefix adjustment across ${files.length} files...`);

let fixedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace text nodes like: <span>${total.toFixed(2)}</span> -> <span>৳{total.toFixed(2)}</span>
  // Note: we must escape the $ character in regex or text replacements
  
  // Pattern 1: $ in JSX text followed by expression e.g. >${p.price.toFixed(2)} or >  ${...}
  // Let's replace >$ with >৳
  content = content.replace(/(>\s*)\$({)/g, '$1৳$2');
  content = content.replace(/(>\s*)\$(\s*{)/g, '$1৳$2');

  // Pattern 2: $ in template string followed by expression e.g. `$${subtotal.toFixed(2)}` -> `৳${subtotal.toFixed(2)}`
  // And `Subtotal: $${...}` -> `Subtotal: ৳${...}`
  content = content.replace(/`\$({)/g, '`৳$1');
  content = content.replace(/`\$({)/g, '`৳$1'); // run twice to cover nested
  content = content.replace(/([: \t]+)\$({)/g, '$1৳$2');
  content = content.replace(/([: \t]+)\$(\s*{)/g, '$1৳$2');

  // Pattern 3: Hardcoded strings with $ symbol representing currency e.g. "Amount ($)" -> "Amount (৳)"
  content = content.replace(/Amount \(\$\)/g, 'Amount (৳)');
  content = content.replace(/Wallet Balance \(\$\)/g, 'Wallet Balance (৳)');
  content = content.replace(/USD \(\$\)/g, 'BDT (৳)');
  content = content.replace(/\bUSD\b/g, 'BDT');
  content = content.replace(/price in USD/gi, 'price in BDT');
  content = content.replace(/currency is in USD/gi, 'currency is in BDT');

  // Let's also check specific hardcoded lines found in scanning:
  // e.g. <span className="text-xs font-black text-neutral-dark">${p.price.toFixed(2)}</span>
  // That will be replaced by: <span className="text-xs font-black text-neutral-dark">৳{p.price.toFixed(2)}</span>
  // Let's replace any remaining >$ or "${" or similar patterns:
  content = content.replace(/"\$\{/g, '"৳${');
  
  // Specific case for text node prefix: e.g. className="...">${...}
  content = content.replace(/>\$\{/g, '>৳{');
  content = content.replace(/Amount \$/gi, 'Amount ৳');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Adjusted currency formats in: ${path.relative(frontendDir, file)}`);
    fixedCount++;
  }
});

console.log(`🎉 Completed! Adjusted ${fixedCount} files to BDT (৳) currency.`);
