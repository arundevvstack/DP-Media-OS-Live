const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. ProductionScene relations
schema = schema.replace(/ProductionShot\s+ProductionShot\[\]/g, 'shots ProductionShot[]');
schema = schema.replace(/ProductionAsset\s+ProductionAsset\[\]/g, 'assets ProductionAsset[]');
schema = schema.replace(/ProductionReference\s+ProductionReference\[\]/g, 'references ProductionReference[]');

// 2. Project relations
schema = schema.replace(/ProjectRequirement\s+ProjectRequirement\[\]/g, 'requirements ProjectRequirement[]');
schema = schema.replace(/CreativeMemory\s+CreativeMemory\[\]/g, 'creative_memories CreativeMemory[]');

// The frontend sometimes expects project.storyboard and sometimes project.production_storyboard. Let's provide storyboard as the relation name.
// Actually, earlier I changed it to production_storyboard. Let's change it to storyboard since GraphEngine and ContextBuilder both use storyboard.
schema = schema.replace(/production_storyboard\s+ProductionStoryboard\?/g, 'storyboard ProductionStoryboard?');
schema = schema.replace(/production_script\s+ProductionScript\?/g, 'script ProductionScript?');

// 3. ProductionShot relations
schema = schema.replace(/PromptSet\s+PromptSet\[\]/g, 'prompt_sets PromptSet[]');
schema = schema.replace(/GeneratedAsset\s+GeneratedAsset\[\]/g, 'generated_assets GeneratedAsset[]');

// 4. ProductionStoryboard relations
schema = schema.replace(/ProductionScene\s+ProductionScene\[\]/g, 'scenes ProductionScene[]');

// 5. ProductionScript missing fields
// It looks like the frontend expects completion_pct and assigned_to on ProductionScript
if (!schema.includes('completion_pct Int @default(0)') && schema.includes('model ProductionScript {')) {
  schema = schema.replace(/model ProductionScript \{/, 'model ProductionScript {\n  completion_pct Int @default(0)\n  assigned_to String?');
}

// 6. ProductionStoryboard missing fields
// Frontend expects completion_pct on ProductionStoryboard
if (!schema.includes('completion_pct Int @default(0)') && schema.includes('model ProductionStoryboard {')) {
  schema = schema.replace(/model ProductionStoryboard \{/, 'model ProductionStoryboard {\n  completion_pct Int @default(0)');
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema relation names patched for Frontend compatibility.');
