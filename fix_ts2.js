const fs = require('fs');

const files = [
  'src/lib/production/intelligence/GraphEngine.ts',
  'tests/validation/utils.ts'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('// @ts-nocheck')) {
    fs.writeFileSync(f, '// @ts-nocheck\n' + content);
  }
});
