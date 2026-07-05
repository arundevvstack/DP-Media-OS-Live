const fs = require('fs');
const path = './prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// Remove UserTeam model
schema = schema.replace(/model UserTeam \{[\s\S]*?\n\}/, '');

// Remove UserTeam relation from User
schema = schema.replace(/\s+UserTeam\s+UserTeam\[\]\n/, '\n');

fs.writeFileSync(path, schema);
console.log('UserTeam removed');
