import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const files = globSync('src/domains/**/*.ts');

let fixedCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const newLines = [];
  const seenImports = new Set();
  let modified = false;

  for (let line of lines) {
    if (line.trim().startsWith('import ') && line.includes(' from ')) {
      // Create a normalized version of the import to check for uniqueness
      const normalized = line.trim().replace(/\s+/g, ' ');
      if (seenImports.has(normalized)) {
        modified = true;
        continue; // skip this duplicate line
      }
      seenImports.add(normalized);
    }
    newLines.push(line);
  }

  if (modified) {
    fs.writeFileSync(file, newLines.join('\n'));
    fixedCount++;
    console.log(`Fixed duplicates in ${file}`);
  }
});

console.log(`Fixed ${fixedCount} files.`);
