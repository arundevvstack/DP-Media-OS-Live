import { NextRequest, NextResponse } from "next/server";
import { BaseService } from "@/core/services/base.service";
import { getUserDetails } from "@/lib/auth";
import { storyboardFrameRepository } from "@/domains/platform/repositories/StoryboardFrameRepository";
import { storyboardFrameRepository } from "@/domains/platform/repositories/StoryboardFrameRepository";
import { storyboardFrameRepository } from "@/domains/platform/repositories/StoryboardFrameRepository";

export class MediaopsStoryboardFrameFrameIdApiService {
    static async handleGET(req: NextRequest, { params }: { params: { frameId: string } }) {
    }

    static async handlePUT(req: NextRequest, { params }: { params: { frameId: string } }) {
    }

    static async handlePOST(req: NextRequest, { params }: { params: { frameId: string } }) {
    }
}