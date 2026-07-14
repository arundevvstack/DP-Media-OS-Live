export interface IdempotencyRecord {
  idempotencyKey: string;
  responseBody: string;
  responseStatus: number;
  lockedAt: Date | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface IIdempotencyRepository {
  findByKey(key: string): Promise<IdempotencyRecord | null>;
  create(key: string, ttlSeconds: number): Promise<void>;
  update(key: string, responseStatus: number, responseBody: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export class InMemoryIdempotencyRepository implements IIdempotencyRepository {
  private store = new Map<string, IdempotencyRecord>();

  async findByKey(key: string): Promise<IdempotencyRecord | null> {
    const record = this.store.get(key);
    if (!record) return null;
    if (record.expiresAt.getTime() < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return record;
  }

  async create(key: string, ttlSeconds: number): Promise<void> {
    if (this.store.has(key)) {
      const existing = this.store.get(key)!;
      if (existing.expiresAt.getTime() > Date.now()) {
        throw new Error('Idempotency key already exists');
      }
    }
    this.store.set(key, {
      idempotencyKey: key,
      responseBody: '',
      responseStatus: 0,
      lockedAt: new Date(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    });
  }

  async update(key: string, responseStatus: number, responseBody: string): Promise<void> {
    const record = this.store.get(key);
    if (record) {
      record.responseStatus = responseStatus;
      record.responseBody = responseBody;
      record.lockedAt = null;
    }
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
