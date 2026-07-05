import prisma from '@/lib/prisma';

export class RiskEngine {
  static async detectRisks(projectId: string) {
    const risks: string[] = [];
    return {
      risk_level: 'MODERATE',
      detected_risks: risks
    };
  }
}
