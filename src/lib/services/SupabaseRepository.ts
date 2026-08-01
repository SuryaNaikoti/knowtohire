import { supabase } from '../supabaseClient';

export interface RepositoryQueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderAscending?: boolean;
  filters?: Record<string, any>;
}

export class SupabaseRepository<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async create(item: Partial<T>): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(item as any)
        .select()
        .single();
      if (error) throw error;
      return data as T;
    } catch (err) {
      console.error(`[SupabaseRepository.create] Error in ${this.tableName}:`, err);
      return null;
    }
  }

  async read(id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as T;
    } catch (err) {
      console.error(`[SupabaseRepository.read] Error in ${this.tableName}:`, err);
      return null;
    }
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(item as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as T;
    } catch (err) {
      console.error(`[SupabaseRepository.update] Error in ${this.tableName}:`, err);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`[SupabaseRepository.delete] Error in ${this.tableName}:`, err);
      return false;
    }
  }

  async find(options: RepositoryQueryOptions = {}): Promise<T[]> {
    try {
      let query = supabase.from(this.tableName).select(options.select || '*');
      
      if (options.filters) {
        for (const [key, val] of Object.entries(options.filters)) {
          if (val !== undefined && val !== null) {
            query = query.eq(key, val);
          }
        }
      }

      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.orderAscending ?? true });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as T[];
    } catch (err) {
      console.error(`[SupabaseRepository.find] Error in ${this.tableName}:`, err);
      return [];
    }
  }
}
