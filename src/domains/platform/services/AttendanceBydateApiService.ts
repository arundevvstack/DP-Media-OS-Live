import { NextRequest, NextResponse } from "next/server";
import { getUserDetails } from "@/lib/auth";
import { userRepository } from "@/domains/identity/repositories/UserRepository";
import { employeeAttendanceRepository } from "@/domains/hrm/repositories/EmployeeAttendanceRepository";

export class AttendanceBydateApiService {
    static async handleGET(req: NextRequest) {
    }
}