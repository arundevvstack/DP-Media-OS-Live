const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Simple string replace for common exact patterns
  content = content.replaceAll("`${Date.now()}-${Math.random().toString(36).slice(2,10)}`", "crypto.randomUUID()");
  content = content.replaceAll("`slide_${Date.now()}_${Math.random().toString(36).substring(7)}`", "crypto.randomUUID()");
  content = content.replaceAll("`CERT-DP-2026-${Math.floor(100000 + Math.random() * 900000)}`", "crypto.randomUUID()");
  
  content = content.replaceAll("PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]", "PROJECT_COLORS[0]");
  content = content.replaceAll("Math.floor(Math.random() * 40) + 50", "75");
  content = content.replaceAll("Math.random() * 16 | 0", "0");
  
  // replace generateId chars random loop
  content = content.replace(/let result = '';\s*for \(let i = 0; i < 20; i\+\+\) \{\s*result \+= chars\.charAt\(Math\.floor\(Math\.random\(\) \* chars\.length\)\);\s*\}/g, "let result = crypto.randomUUID().replace(/-/g, '').substring(0, 20);");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed math.random in ' + file);
  }
});
