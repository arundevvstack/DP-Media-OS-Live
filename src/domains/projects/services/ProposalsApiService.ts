import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export class ProposalsApiService {
    static async handlePOST(req: NextRequest) {
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { payload: { error: 'Unauthorized' }, status: 401 };

            const profile = await prisma.user.findFirst({ where: { id: user.id } });
            if (!profile || !profile.company_id) return { payload: { error: 'Forbidden' }, status: 403 };

            const body = await req.json();
            
            const proposal = await prisma.proposal.create({
                data: {
                    id: crypto.randomUUID(),
                    company_id: profile.company_id,
                    title: body.title || "Untitled Proposal",
                    proposal_number: body.proposal_number || `PRP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    content: body.content || "[]",
                    status: body.status || "draft",
                    prospect_id: body.prospect_id || null,
                    requirement_id: body.requirement_id || null
                }
            });

            if (body.prospect_id) {
                try {
                    await prisma.prospect.update({
                        where: { id: body.prospect_id },
                        data: { proposal_status: 'created' }
                    });
                } catch (e) {
                    console.error("Failed to update prospect proposal_status:", e);
                }
            }

            return { payload: { proposal }, status: 200 };
        } catch (e: any) {
            console.error("Proposal POST Error:", e);
            return { payload: { error: e.message }, status: 500 };
        }
    }

    static async handleGET(req: NextRequest) {
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { payload: { error: 'Unauthorized' }, status: 401 };

            const profile = await prisma.user.findFirst({ where: { id: user.id } });
            if (!profile || !profile.company_id) return { payload: { error: 'Forbidden' }, status: 403 };

            const proposals = await prisma.proposal.findMany({
                where: { company_id: profile.company_id },
                orderBy: { created_at: 'desc' }
            });

            return { payload: { proposals }, status: 200 };
        } catch (e: any) {
            console.error("Proposal GET Error:", e);
            return { payload: { error: e.message }, status: 500 };
        }
    }
}