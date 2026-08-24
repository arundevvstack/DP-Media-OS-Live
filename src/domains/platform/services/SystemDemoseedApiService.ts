import { NextResponse } from "next/server";
import { operationalTelemetryRepository } from "@/domains/platform/repositories/OperationalTelemetryRepository";
import { infrastructureIncidentRepository } from "@/domains/platform/repositories/InfrastructureIncidentRepository";
import { projectRepository } from "@/domains/projects/repositories/ProjectRepository";
import { projectHealthScoreRepository } from "@/domains/platform/repositories/ProjectHealthScoreRepository";

export class SystemDemoseedApiService {
    static async handlePOST(req: Request) {
    }
}
