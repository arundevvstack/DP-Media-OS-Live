const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // robust replacement for findUnique -> findFirst if the where clause has company_id
  let regex = /\.findUnique\(\s*\{[\s\S]*?where:\s*\{([^}]*company_id[^}]*)\}[\s\S]*?\}\s*\)/g;
  
  content = content.replace(regex, (match) => {
    return match.replace('.findUnique(', '.findFirst(');
  });

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed multiline in', file);
    count++;
  }
});
console.log('Fixed count:', count);
