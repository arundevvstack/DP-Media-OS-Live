const fs = require('fs');
const text = fs.readFileSync('src/core/engines/workflow.engine.ts', 'utf8');
const lines = text.split('\n');
lines.forEach((l, i) => {
    if (l.includes('`')) {
        console.log(i + 1, l);
    }
});
