const fs = require("fs");
let schema = fs.readFileSync("prisma/schema.prisma", "utf8");

const companyInsert = `
  EmployeeDocument EmployeeDocument[]
  EmployeeAttendance EmployeeAttendance[]
  EmployeePerformance EmployeePerformance[]
  EmployeeTraining EmployeeTraining[]
`;

const userInsert = `
  EmployeeDocument EmployeeDocument[]
  EmployeeAttendance EmployeeAttendance[]
  EmployeePerformance EmployeePerformance[] @relation("PerformanceUser")
  EmployeePerformance_Reviewer EmployeePerformance[] @relation("PerformanceReviewer")
  EmployeeTraining EmployeeTraining[]
`;

schema = schema.replace(/model Company \{/, `model Company {\n${companyInsert}`);
schema = schema.replace(/model User \{/, `model User {\n${userInsert}`);

fs.writeFileSync("prisma/schema.prisma", schema);
