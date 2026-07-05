const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

const hrModels = `
model OrganizationUnit {
  id          String   @id @default(uuid())
  company_id  String
  name        String
  type        String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
}

model Designation {
  id          String   @id @default(uuid())
  company_id  String
  name        String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
}

model JobGrade {
  id          String   @id @default(uuid())
  company_id  String
  name        String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
}

model Shift {
  id          String   @id @default(uuid())
  company_id  String
  name        String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
}

model PayrollGroup {
  id          String   @id @default(uuid())
  company_id  String
  name        String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
}

model MasterDataRecord {
  id          String   @id @default(uuid())
  company_id  String
  category    String
  name        String
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
}
`;

if (!schema.includes("model OrganizationUnit")) {
    schema += "\n" + hrModels;
}
fs.writeFileSync("prisma/schema.prisma", schema);
