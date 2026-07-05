const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// The frontend uses `production_script`
schema = schema.replace(/script\s+ProductionScript\?/g, 'production_script ProductionScript?');

// The frontend predominantly uses `production_storyboard`
schema = schema.replace(/storyboard\s+ProductionStoryboard\?/g, 'production_storyboard ProductionStoryboard?');

fs.writeFileSync('prisma/schema.prisma', schema);

// Now fix ContextBuilder to use production_storyboard instead of storyboard
let contextBuilder = fs.readFileSync('src/lib/production/assistant/ContextBuilder.ts', 'utf8');
contextBuilder = contextBuilder.replace(/project\.storyboard/g, 'project.production_storyboard');
fs.writeFileSync('src/lib/production/assistant/ContextBuilder.ts', contextBuilder);

// GraphEngine uses storyboard too
let graphEngine = fs.readFileSync('src/lib/production/intelligence/GraphEngine.ts', 'utf8');
graphEngine = graphEngine.replace(/project\.storyboard/g, 'project.production_storyboard');
fs.writeFileSync('src/lib/production/intelligence/GraphEngine.ts', graphEngine);

console.log('Final alignment done.');
