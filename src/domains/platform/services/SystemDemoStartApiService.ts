import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { EventBus } from "@/lib/event-bus";

export class SystemDemoStartApiService {
    static async handlePOST(req: Request) {
    }
}