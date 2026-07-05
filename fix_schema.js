const fs = require('fs');

const path = 'prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// Fix 1: Add @default(uuid()) to String @id where missing
schema = schema.replace(/id\s+String\s+@id(?!\s+@default)/g, 'id String @id @default(uuid())');

// Fix 2: Add @default(now()) and @updatedAt to updated_at where missing
// Many models just have `updated_at DateTime`
schema = schema.replace(/updated_at\s+DateTime\s*(?!@updatedAt|@default)/g, 'updated_at DateTime @updatedAt @default(now())');
schema = schema.replace(/created_at\s+DateTime\s*(?!@default)/g, 'created_at DateTime @default(now())');

// Fix 3: Fix relation casing for Project
// In Project model, the relations are named ProductionScript and ProductionStoryboard but the frontend expects production_script
// Actually, Prisma uses the relation name as the field name. 
// Let's lowercase the relation fields in Project model so they match what the frontend expects!
schema = schema.replace(/ProductionScript\s+ProductionScript\?/g, 'production_script ProductionScript?');
schema = schema.replace(/ProductionStoryboard\s+ProductionStoryboard\?/g, 'production_storyboard ProductionStoryboard?');
schema = schema.replace(/Company\s+Company\?/g, 'company Company?');
schema = schema.replace(/ReviewSession\s+ReviewSession\[\]/g, 'reviewSessions ReviewSession[]');

fs.writeFileSync(path, schema);
console.log('Schema fixed.');
