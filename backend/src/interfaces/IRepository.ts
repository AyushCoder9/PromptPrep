/**
 * IRepository<T> — Generic Repository Pattern Interface
 *
 * Provides a uniform data access contract.
 * All concrete repositories implement this interface,
 * decoupling business logic from data access details.
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Record<string, unknown>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
