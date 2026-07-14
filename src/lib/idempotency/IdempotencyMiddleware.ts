import { NextRequest, NextResponse } from 'next/server';
import { IdempotencyService } from './IdempotencyService';
import { InMemoryIdempotencyRepository } from './IdempotencyRepository';

// For Next.js App Router we can create a middleware wrapper
// A persistent repository (like Redis or DB) should be injected in production.
const defaultRepository = new InMemoryIdempotencyRepository();
const idempotencyService = new IdempotencyService(defaultRepository);

export async function withIdempotency(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const idempotencyKey = req.headers.get('x-idempotency-key');
  
  if (!idempotencyKey) {
    return handler(req); // Bypass if no key provided
  }

  try {
    const cachedResponse = await idempotencyService.beginOperation(idempotencyKey);
    
    if (cachedResponse) {
      return new NextResponse(cachedResponse.body, {
        status: cachedResponse.status,
        headers: {
          'x-idempotent-replayed': 'true',
          'Content-Type': 'application/json',
        }
      });
    }

    const response = await handler(req);
    const body = await response.clone().text();

    await idempotencyService.finishOperation(idempotencyKey, response.status, body);
    
    return response;
  } catch (error: any) {
    if (error.code === 'CONFLICT') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    // Clean up on generic failures so the client can retry
    if (idempotencyKey) {
      await idempotencyService.cleanupFailedOperation(idempotencyKey).catch(() => {});
    }
    throw error;
  }
}
