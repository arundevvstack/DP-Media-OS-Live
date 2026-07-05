const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const lines = schema.split('\n');
const fixedLines = lines.map(line => {
  // Trim the line for safe checking, but preserve original whitespace for output
  const trimmed = line.trim();
  let result = line;

  // Match `id String @id` exactly
  if (trimmed.startsWith('id ') && trimmed.includes('String') && trimmed.includes('@id')) {
    if (!trimmed.includes('@default')) {
      result = line.replace('@id', '@id @default(uuid())');
    }
  }
  
  // Match `updated_at DateTime`
  if (trimmed.startsWith('updated_at ') && trimmed.includes('DateTime')) {
    let toAppend = '';
    if (!trimmed.includes('@updatedAt')) {
      toAppend += ' @updatedAt';
    }
    if (!trimmed.includes('@default')) {
      toAppend += ' @default(now())';
    }
    // Only append if it's not already there.
    // Ensure we don't accidentally swallow the carriage return \r if it exists
    if (toAppend) {
      result = line.replace('\r', '') + toAppend + (line.endsWith('\r') ? '\r' : '');
    }
  }
  
  // Match `created_at DateTime`
  if (trimmed.startsWith('created_at ') && trimmed.includes('DateTime')) {
    if (!trimmed.includes('@default')) {
      result = line.replace('\r', '') + ' @default(now())' + (line.endsWith('\r') ? '\r' : '');
    }
  }
  
  // Lowercase specific problematic relations
  if (trimmed.startsWith('ProductionScript ') && trimmed.includes('ProductionScript?')) {
    result = line.replace('ProductionScript', 'production_script');
  }
  if (trimmed.startsWith('ProductionStoryboard ') && trimmed.includes('ProductionStoryboard?')) {
    result = line.replace('ProductionStoryboard', 'production_storyboard');
  }
  if (trimmed.startsWith('Company ') && trimmed.includes('Company?')) {
    result = line.replace('Company', 'company');
  }
  if (trimmed.startsWith('ReviewSession ') && trimmed.includes('ReviewSession[]')) {
    result = line.replace('ReviewSession', 'reviewSessions');
  }

  return result;
});

fs.writeFileSync('prisma/schema.prisma', fixedLines.join('\n'));
console.log('Schema robustly patched.');
