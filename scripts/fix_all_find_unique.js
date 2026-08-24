const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.ts');
files.push(...glob.sync('src/**/*.tsx'));
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We are looking for .findUnique({ where: { ..., company_id } })
  // A simpler way: just replace all findUnique with findFirst where the query contains company_id and it's NOT a model that has @@unique([id, company_id])
  // In our schema, almost NO models have @@unique([id, company_id]).
  // Let's just find and replace any `.findUnique` that has `company_id` in its where clause.
  content = content.replace(/\.findUnique\(\s*{\s*where:\s*{([^}]*company_id[^}]*)}\s*(?:,\s*include:\s*{[^}]*})?\s*}\s*\)/g, (match) => {
    return match.replace('.findUnique', '.findFirst');
  });

  if (original !== content) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
    count++;
  }
});
console.log('Fixed count:', count);
