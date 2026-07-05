const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const lines = schema.split('\n');
const fixedLines = lines.map(line => {
  // If the line is an `id` field of type String and is @id
  if (line.match(/^\s+id\s+String\s+@id/)) {
    // If it lacks a @default
    if (!line.includes('@default')) {
      return line.replace('@id', '@id @default(uuid())');
    }
  }
  
  // If the line is `updated_at` of type DateTime
  if (line.match(/^\s+updated_at\s+DateTime/)) {
    let replaced = line;
    if (!replaced.includes('@updatedAt')) {
      replaced += ' @updatedAt';
    }
    if (!replaced.includes('@default')) {
      replaced += ' @default(now())';
    }
    return replaced;
  }
  
  // If the line is `created_at` of type DateTime
  if (line.match(/^\s+created_at\s+DateTime/)) {
    if (!line.includes('@default')) {
      return line + ' @default(now())';
    }
  }

  return line;
});

fs.writeFileSync('prisma/schema.prisma', fixedLines.join('\n'));
console.log('Schema perfectly patched line-by-line.');
