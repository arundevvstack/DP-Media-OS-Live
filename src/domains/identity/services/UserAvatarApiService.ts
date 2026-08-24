import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export class UserAvatarApiService {
    static async handlePOST(req: Request) {
    }
}
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);