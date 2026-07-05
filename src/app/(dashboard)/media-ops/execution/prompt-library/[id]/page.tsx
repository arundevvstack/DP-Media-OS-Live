import React from "react";
import prisma from "@/lib/prisma";
import { getUserDetails } from '@/lib/auth';
import { notFound } from "next/navigation";
import { ChevronLeft, Plus, Save, Trash, Play, Info } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function PromptLibraryDetailsPage({ params }: { params: { id: string } }) {
  return notFound();
}
