export interface DomainEvent<T = any> {
  id: string;
  type: string;
  timestamp: Date;
  payload: T;
  correlationId?: string;
}
