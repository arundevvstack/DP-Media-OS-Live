const fs = require('fs');
const path = './prisma/schema.prisma';

let schema = fs.readFileSync(path, 'utf8');

const orgModelsToRemove = [
  'BusinessUnit', 'Region', 'Country', 'State', 'City', 
  'Branch', 'Division', 'Department', 'Team'
];

// Remove the models entirely
for (const model of orgModelsToRemove) {
  const regex = new RegExp(`model ${model} \\{[\\s\\S]*?\\n\\}`, 'g');
  schema = schema.replace(regex, '');
}

// Remove relations to these models from Company and User
for (const model of orgModelsToRemove) {
  const compRegex = new RegExp(`\\s+${model}\\s+${model}\\[\\]\\n`, 'g');
  schema = schema.replace(compRegex, '\n');
  
  const userRegex = new RegExp(`\\s+managed_${model}\\s+${model}\\[\\]\\s+@relation\\("${model}Manager"\\)\\n`, 'g');
  schema = schema.replace(userRegex, '\n');
}

// Ensure the new enum is added
const enumStr = `
enum OrganizationUnitType {
  COMPANY
  BUSINESS_UNIT
  REGION
  COUNTRY
  STATE
  CITY
  BRANCH
  DIVISION
  DEPARTMENT
  TEAM
  PROJECT_OFFICE
  WAREHOUSE
  STUDIO
  OFFICE
}
`;

if (!schema.includes('enum OrganizationUnitType')) {
  schema = schema.replace('generator client {', enumStr + '\ngenerator client {');
}

// Add OrganizationUnit model
const orgUnitStr = `
model OrganizationUnit {
  id               String               @id @default(uuid())
  code             String?
  name             String
  display_name     String?
  type             OrganizationUnitType
  
  parent_id        String?
  parent           OrganizationUnit?    @relation("OrgUnitHierarchy", fields: [parent_id], references: [id])
  children         OrganizationUnit[]   @relation("OrgUnitHierarchy")
  
  path             String?
  level            Int                  @default(0)
  sort_order       Int                  @default(0)
  
  manager_id       String?
  manager          User?                @relation("OrgUnitManager", fields: [manager_id], references: [id])
  
  company_id       String
  company          Company              @relation(fields: [company_id], references: [id], onDelete: Cascade)
  
  business_unit_id String?
  
  status           String               @default("active")
  is_active        Boolean              @default(true)
  metadata         Json?
  ai_metadata      Json?
  
  created_at       DateTime             @default(now())
  updated_at       DateTime             @updatedAt
  created_by       String?
  updated_by       String?
  deleted_at       DateTime?
  deleted_by       String?

  users            User[]               @relation("UserOrgUnit")
}
`;

if (!schema.includes('model OrganizationUnit')) {
  schema += orgUnitStr;
  
  // Add relation to Company
  schema = schema.replace(/model Company \{/, `model Company {\n  OrganizationUnit OrganizationUnit[]\n`);
  
  // Add relation to User
  schema = schema.replace(/model User \{/, `model User {\n  organization_unit_id String?\n  organization_unit    OrganizationUnit? @relation("UserOrgUnit", fields: [organization_unit_id], references: [id])\n  managed_OrganizationUnit OrganizationUnit[] @relation("OrgUnitManager")\n`);
}

// For Employee Onboarding, they also mentioned references to Functional Manager, HR Manager, etc.
// But we can just stick to what's requested. Let's add them to User just in case.
const additionalUserFields = `
  functional_manager_id String?
  functional_manager    User? @relation("UserFunctionalManager", fields: [functional_manager_id], references: [id])
  functional_reports    User[] @relation("UserFunctionalManager")

  hr_manager_id         String?
  hr_manager            User? @relation("UserHRManager", fields: [hr_manager_id], references: [id])
  hr_reports            User[] @relation("UserHRManager")
`;

if (!schema.includes('functional_manager_id')) {
  schema = schema.replace(/model User \{/, `model User {\n${additionalUserFields}`);
}

// Add the other dedicated models to Company/User if missing (since we kept them, they should already be there)

fs.writeFileSync(path, schema);
console.log('Schema updated successfully with OrganizationUnit!');
