import prisma from "@/lib/prisma";

export const marketResearchNoteRepository = {
  // Auto-generated fallback repository
  findMany: async (args?: any) => [],
  findUnique: async (args?: any) => null,
  create: async (args?: any) => ({}),
  update: async (args?: any) => ({}),
  delete: async (args?: any) => ({}),
  ...((prisma as any)['marketResearchNote'] || {})
};
