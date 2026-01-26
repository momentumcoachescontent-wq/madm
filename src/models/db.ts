
/**
 * Safe wrapper for D1Database.prepare(query).bind(...args).first<T>()
 * Returns the first result or null.
 */
export const dbFirst = async <T = unknown>(
  db: D1Database,
  query: string,
  args: any[] = []
): Promise<T | null> => {
  return await db.prepare(query).bind(...args).first<T>()
}

/**
 * Safe wrapper for D1Database.prepare(query).bind(...args).all<T>()
 * Returns the array of results (T[]).
 */
export const dbAll = async <T = unknown>(
  db: D1Database,
  query: string,
  args: any[] = []
): Promise<T[]> => {
  const result = await db.prepare(query).bind(...args).all<T>()
  return result.results
}

/**
 * Safe wrapper for D1Database.prepare(query).bind(...args).run()
 * Returns the meta object (D1Meta) containing changes, last_row_id, etc.
 */
export const dbRun = async (
  db: D1Database,
  query: string,
  args: any[] = []
): Promise<D1Meta> => {
  const result = await db.prepare(query).bind(...args).run()
  return result.meta
}
