const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Insert into User model
if (!schema.includes('LeaveRequest        LeaveRequest[]')) {
    schema = schema.replace(/(model User \{[\s\S]*?timeline_events ProductionTimelineEvent\[\]\r?\n)/, `$1  LeaveRequest        LeaveRequest[]\n`);
}

// Append models
if (!schema.includes('model LeaveType {')) {
    schema += `

model LeaveType {
  id          String   @id @default(uuid())
  company_id  String
  name        String
  description String?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt @default(now())

  LeaveRequest LeaveRequest[]
  Company      Company        @relation(fields: [company_id], references: [id], onDelete: Cascade)
}

model LeaveRequest {
  id            String   @id @default(uuid())
  user_id       String
  leave_type_id String
  start_date    DateTime
  end_date      DateTime
  days          Float
  status        String   @default("PENDING")
  reason        String?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt @default(now())

  User      User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  LeaveType LeaveType @relation(fields: [leave_type_id], references: [id], onDelete: Cascade)
}
`;
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully');
