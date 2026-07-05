const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

const moreHrModels = `
model EmployeeDocument {
  id          String   @id @default(uuid())
  company_id  String
  user_id     String
  name        String
  type        String
  url         String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  User        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model EmployeeAttendance {
  id          String   @id @default(uuid())
  company_id  String
  user_id     String
  date        DateTime
  status      String
  check_in    DateTime?
  check_out   DateTime?
  location    String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  User        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model EmployeePerformance {
  id          String   @id @default(uuid())
  company_id  String
  user_id     String
  period      String
  score       Float
  feedback    String?
  status      String
  reviewer_id String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  User        User     @relation("PerformanceUser", fields: [user_id], references: [id], onDelete: Cascade)
  Reviewer    User     @relation("PerformanceReviewer", fields: [reviewer_id], references: [id], onDelete: Cascade)
}

model EmployeeTraining {
  id           String   @id @default(uuid())
  company_id   String
  user_id      String
  course_name  String
  status       String
  score        Float?
  completed_at DateTime?
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt @default(now())
  Company      Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  User         User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
`;

if (!schema.includes("model EmployeeDocument")) {
    schema += "\n" + moreHrModels;
}
fs.writeFileSync("prisma/schema.prisma", schema);
