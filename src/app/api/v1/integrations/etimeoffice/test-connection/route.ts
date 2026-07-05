import { NextRequest, NextResponse } from 'next/server';
import { testConnection, isConfigured } from '@/lib/etimeoffice';

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({
      success: false,
      message: 'Credentials not configured. Set ETIMEOFFICE_CORP_ID, ETIMEOFFICE_USERNAME and ETIMEOFFICE_PASSWORD in .env',
      url_tested: null
    });
  }

  const result = await testConnection();
  return NextResponse.json({
    ...result,
    url_tested: `${(process.env.ETIMEOFFICE_BASE_URL || 'https://www.etimeoffice.com').replace(/\/$/, '')}/Login/loginCheck`
  });
}
