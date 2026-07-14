import { describe, it, expect, beforeEach } from 'vitest';
import { IdempotencyService, InMemoryIdempotencyRepository } from '../../src/lib/idempotency';

describe('IdempotencyService', () => {
  let repository: InMemoryIdempotencyRepository;
  let service: IdempotencyService;

  beforeEach(() => {
    repository = new InMemoryIdempotencyRepository();
    service = new IdempotencyService(repository);
  });

  it('should allow first request and lock it', async () => {
    const result = await service.beginOperation('test-key-1');
    expect(result).toBeNull();
  });

  it('should throw conflict if concurrent request arrives', async () => {
    await service.beginOperation('test-key-2');
    await expect(service.beginOperation('test-key-2')).rejects.toThrow('Concurrent request');
  });

  it('should return cached response if already finished', async () => {
    await service.beginOperation('test-key-3');
    await service.finishOperation('test-key-3', 201, '{"success":true}');

    const result = await service.beginOperation('test-key-3');
    expect(result).toEqual({ status: 201, body: '{"success":true}' });
  });
});
