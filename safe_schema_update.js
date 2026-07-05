const fs = require('fs');

let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Safely add @default(uuid()) to @id that don't have it
code = code.replace(/id\s+String\s+@id(\s*)$/gm, 'id String @id @default(uuid())$1');

// Safely add @updatedAt to updated_at that don't have it
code = code.replace(/updated_at\s+DateTime(\s*)$/gm, 'updated_at DateTime @updatedAt$1');

// Carefully replace specific models by finding their block
function addRelationToModel(modelName, relationString) {
  const modelRegex = new RegExp(`(model ${modelName} \\{[\\s\\S]*?\\})`);
  const match = code.match(modelRegex);
  if (match) {
    let block = match[1];
    // Insert before the closing brace
    block = block.replace(/\\}$/, `  ${relationString}\n}`);
    code = code.replace(modelRegex, block);
  }
}

addRelationToModel('Project', 'requirements RequirementChart[]\n  objectives Objective[]\n  creative_memories CreativeMemory[]\n  ProductionStoryboard ProductionStoryboard?');
addRelationToModel('ProductionStoryboard', 'scenes ProductionScene[]');
addRelationToModel('ProductionShot', 'creative_memories CreativeMemory[]\n  generated_assets ProductionAssetVersion[]');
addRelationToModel('ProductionAIJob', 'provider ProductionProviderCredential? @relation(fields: [provider_id], references: [provider_id])');

fs.writeFileSync('prisma/schema.prisma', code);
