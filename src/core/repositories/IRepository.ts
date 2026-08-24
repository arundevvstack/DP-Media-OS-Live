export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(params?: any): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<boolean>;
}
