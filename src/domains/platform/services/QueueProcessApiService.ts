import { NextResponse } from "next/server";
import { notificationQueueRepository } from "@/domains/platform/repositories/NotificationQueueRepository";

export class QueueProcessApiService {
    static async handlePOST(req: Request) {
    }
}

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';