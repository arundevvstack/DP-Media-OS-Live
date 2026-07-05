const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

const payrollModels = `
model SalaryStructure {
  id                String   @id @default(uuid())
  company_id        String
  name              String
  base_salary       Float
  hra_percent       Float
  da_percent        Float
  special_allowance Float
  status            String   @default("ACTIVE")
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt @default(now())
  
  Company           Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  EmployeeSalaries  EmployeeSalary[]
}

model EmployeeSalary {
  id           String   @id @default(uuid())
  company_id   String
  user_id      String   @unique
  structure_id String
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt @default(now())
  
  Company      Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  User         User     @relation("UserEmployeeSalary", fields: [user_id], references: [id], onDelete: Cascade)
  Structure    SalaryStructure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
}

model Loan {
  id          String   @id @default(uuid())
  company_id  String
  user_id     String
  amount      Float
  emi         Float
  outstanding Float
  status      String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  User        User     @relation("UserLoans", fields: [user_id], references: [id], onDelete: Cascade)
}

model PayrollPeriod {
  id          String   @id @default(uuid())
  company_id  String
  name        String
  start_date  DateTime
  end_date    DateTime
  status      String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  PayrollRuns PayrollRun[]
}

model PayrollRun {
  id               String   @id @default(uuid())
  company_id       String
  period_id        String
  user_id          String
  gross_pay        Float
  net_pay          Float
  total_allowances Float
  total_deductions Float
  status           String
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt @default(now())
  
  Company          Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  Period           PayrollPeriod @relation(fields: [period_id], references: [id], onDelete: Cascade)
  User             User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  Items            PayrollRunItem[]
}

model PayrollRunItem {
  id         String   @id @default(uuid())
  run_id     String
  type       String
  name       String
  amount     Float
  created_at DateTime @default(now())
  
  Run        PayrollRun @relation(fields: [run_id], references: [id], onDelete: Cascade)
}

model Reimbursement {
  id          String   @id @default(uuid())
  company_id  String
  user_id     String
  type        String
  amount      Float
  description String?
  status      String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())
  
  Company     Company  @relation(fields: [company_id], references: [id], onDelete: Cascade)
  User        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
`;

const companyInsert = `
  SalaryStructure SalaryStructure[]
  EmployeeSalary EmployeeSalary[]
  Loan Loan[]
  PayrollPeriod PayrollPeriod[]
  PayrollRun PayrollRun[]
  Reimbursement Reimbursement[]
`;

const userInsert = `
  UserEmployeeSalary EmployeeSalary? @relation("UserEmployeeSalary")
  UserLoans Loan[] @relation("UserLoans")
  PayrollRun PayrollRun[]
  Reimbursement Reimbursement[]
`;

if (!schema.includes("model SalaryStructure")) {
    schema += "\n" + payrollModels;
    schema = schema.replace(/model Company \{/, `model Company {\n${companyInsert}`);
    schema = schema.replace(/model User \{/, `model User {\n${userInsert}`);
    fs.writeFileSync("prisma/schema.prisma", schema);
}
