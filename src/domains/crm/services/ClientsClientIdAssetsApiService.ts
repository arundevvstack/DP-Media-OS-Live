import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export class ClientsClientIdAssetsApiService {
    static async handlePOST(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
    }
}
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);