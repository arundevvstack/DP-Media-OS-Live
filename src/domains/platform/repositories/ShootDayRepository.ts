import prisma from "@/lib/prisma";

export const shootDayRepository = {
  // Auto-generated fallback repository
  findMany: async (args?: any) => [],
  findUnique: async (args?: any) => null,
  create: async (args?: any) => ({}),
  update: async (args?: any) => ({}),
  delete: async (args?: any) => ({}),
  ...((prisma as any)['shootDay'] || {})
};
