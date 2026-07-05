const fs = require('fs');
const schemaPath = 'prisma/schema.prisma';

const missingModels = `
// ==========================================
// RC-2: RESTORED HR & INTELLIGENCE MODELS
// ==========================================

model JobRequisition {
  id              String   @id @default(uuid())
  title           String
  status          String   @default("PUBLISHED")
  location        String?
  employment_type String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  Applications    CandidateApplication[]
  HiringManager   User?    @relation(fields: [hiring_manager_id], references: [id])
  hiring_manager_id String?
}

model Candidate {
  id              String   @id @default(uuid())
  name            String
  email           String   @unique
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  Applications    CandidateApplication[]
}

model CandidateApplication {
  id              String   @id @default(uuid())
  candidate_id    String
  requisition_id  String
  status          String   @default("APPLIED")
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  Candidate       Candidate @relation(fields: [candidate_id], references: [id])
  JobRequisition  JobRequisition @relation(fields: [requisition_id], references: [id])
}

model Interview {
  id              String   @id @default(uuid())
  scheduled_at    DateTime
  status          String   @default("SCHEDULED")
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model JobOffer {
  id              String   @id @default(uuid())
  status          String   @default("DRAFT")
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model AttendanceRecord {
  id              String   @id @default(uuid())
  user_id         String
  date            DateTime
  status          String
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model LeaveRequest {
  id              String   @id @default(uuid())
  user_id         String
  status          String   @default("PENDING")
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model Milestone {
  id              String   @id @default(uuid())
  project_id      String?
  name            String
  status          String   @default("PENDING")
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model Budget {
  id              String   @id @default(uuid())
  project_id      String?
  amount          Float
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model ProjectMember {
  id              String   @id @default(uuid())
  project_id      String
  user_id         String
  role            String
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}

model MasterDataCategory {
  id              String   @id @default(uuid())
  name            String
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
`;

// Append models
let content = fs.readFileSync(schemaPath, 'utf8');
if (!content.includes('model JobRequisition')) {
  content += '\n' + missingModels;
}

// Inject missing relations into existing models via regex
// 1. User
content = content.replace(/model User \{/, \`model User {
  functional_manager_id String?
  JobRequisitions      JobRequisition[]
\`);

// 2. Project
content = content.replace(/model Project \{/, \`model Project {
  objectives           Json?
  requirements         Json?
  storyboard           Json?
  ReviewSessions       Json?
\`);

// 3. ProductionStoryboard
content = content.replace(/model ProductionStoryboard \{/, \`model ProductionStoryboard {
  scenes               Json?
\`);

// 4. ProductionShot
content = content.replace(/model ProductionShot \{/, \`model ProductionShot {
  generated_assets     Json?
\`);

// 5. ProductionScene
if(content.includes('model ProductionScene')) {
    content = content.replace(/model ProductionScene \{/, \`model ProductionScene {
      shots               Json?
      creative_memories   Json?
    \`);
} else {
    // If ProductionScene is missing entirely, just add the relation to Storyboard/Shot where it might be expected
}

// 6. ProductionAIJob
content = content.replace(/model ProductionAIJob \{/, \`model ProductionAIJob {
  provider             Json?
\`);

fs.writeFileSync(schemaPath, content);
console.log('Restored RC-2 Prisma schema tables and relations.');
