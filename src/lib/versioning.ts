import * as Diff from 'diff'

export type EntityType = 'blog_post' | 'course' | 'lesson'

export interface Version {
  id: number
  created_at: string
  created_by?: number | null
  status: 'draft' | 'published' | 'archived'
  change_summary?: string | null
  // Dynamic fields based on entity
  title?: string
  content?: string
  [key: string]: any
}

export class VersioningService {
  private db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  /**
   * Helper to get the table name for versions based on entity type
   */
  private getTableName(entityType: EntityType): string {
    switch (entityType) {
      case 'blog_post': return 'blog_post_versions'
      case 'course': return 'course_versions'
      case 'lesson': return 'lesson_versions'
      default: throw new Error(`Unknown entity type: ${entityType}`)
    }
  }

  /**
   * Helper to get the foreign key column name
   */
  private getForeignKey(entityType: EntityType): string {
    switch (entityType) {
      case 'blog_post': return 'post_id'
      case 'course': return 'course_id'
      case 'lesson': return 'lesson_id'
      default: throw new Error(`Unknown entity type: ${entityType}`)
    }
  }

  /**
   * Get valid columns for versioning per entity type
   */
  private getValidColumns(entityType: EntityType): string[] {
      switch (entityType) {
          case 'blog_post':
              return ['title', 'slug', 'content', 'excerpt', 'image_url', 'hashtags', 'scheduled_at']
          case 'course':
              return [
                  'slug', 'title', 'subtitle', 'description', 'duration_weeks', 'level',
                  'price', 'currency', 'featured_image', 'instructor_name', 'instructor_bio',
                  'what_you_learn', 'course_content', 'requirements', 'target_audience', 'testimonials'
              ]
          case 'lesson':
              return [
                  'module_number', 'lesson_number', 'title', 'description', 'video_url',
                  'video_duration', 'content', 'order_index', 'is_preview'
              ]
          default:
              return []
      }
  }

  /**
   * Create a new version
   */
  async createVersion(
    entityType: EntityType,
    entityId: number,
    data: Record<string, any>,
    status: 'draft' | 'published' | 'archived' = 'draft',
    userId?: number | null
  ): Promise<number> {
    const table = this.getTableName(entityType)
    const fk = this.getForeignKey(entityType)
    const validColumns = this.getValidColumns(entityType)

    // Filter data to only include valid columns
    const filteredData: Record<string, any> = {}
    validColumns.forEach(col => {
        if (data[col] !== undefined) {
            filteredData[col] = data[col]
        }
    })

    if (Object.keys(filteredData).length === 0) {
        console.warn(`No valid version data found for ${entityType} ID ${entityId}`)
        // Should we throw? Or just create an empty version metadata?
        // Let's proceed, maybe it's just a status update.
    }

    const keys = Object.keys(filteredData)

    // Add version meta fields
    const columns = [fk, 'status', 'created_by', ...keys]
    const placeholders = columns.map(() => '?').join(', ')
    const values = [entityId, status, userId || null, ...keys.map(k => filteredData[k])]

    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
    `

    const res = await this.db.prepare(query).bind(...values).run()
    return res.meta.last_row_id as number
  }

  /**
   * Get all versions for an entity
   */
  async getVersions(entityType: EntityType, entityId: number): Promise<Version[]> {
    const table = this.getTableName(entityType)
    const fk = this.getForeignKey(entityType)

    const results = await this.db.prepare(`
      SELECT * FROM ${table}
      WHERE ${fk} = ?
      ORDER BY created_at DESC
    `).bind(entityId).all()

    return results.results as unknown as Version[]
  }

  /**
   * Get a specific version
   */
  async getVersion(entityType: EntityType, versionId: number): Promise<Version | null> {
    const table = this.getTableName(entityType)
    const result = await this.db.prepare(`
      SELECT * FROM ${table} WHERE id = ?
    `).bind(versionId).first()

    return result as unknown as Version | null
  }

  /**
   * Get the latest version (draft or published)
   */
  async getLatestVersion(entityType: EntityType, entityId: number): Promise<Version | null> {
    const table = this.getTableName(entityType)
    const fk = this.getForeignKey(entityType)

    return await this.db.prepare(`
      SELECT * FROM ${table}
      WHERE ${fk} = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(entityId).first() as unknown as Version | null
  }

  /**
   * Restore a version (Create a new draft based on an old version)
   */
  async restoreVersion(entityType: EntityType, entityId: number, versionId: number, userId?: number): Promise<number> {
    const version = await this.getVersion(entityType, versionId)
    if (!version) throw new Error('Version not found')

    // Create a new version with status 'draft'
    // We pass the version object itself as data. createVersion handles filtering.
    return this.createVersion(entityType, entityId, version, 'draft', userId)
  }

  /**
   * Delete a version
   */
  async deleteVersion(entityType: EntityType, versionId: number): Promise<void> {
    const table = this.getTableName(entityType)
    await this.db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(versionId).run()
  }

  /**
   * Compare two text strings and return HTML diff
   */
  compareText(oldText: string, newText: string): string {
    const diff = Diff.diffWords(oldText || '', newText || '')

    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    return diff.map(part => {
      const color = part.added ? '#dcfce7' : part.removed ? '#fee2e2' : 'transparent'
      const textDecoration = part.removed ? 'line-through' : 'none'
      const fontWeight = part.added ? 'bold' : 'normal'
      const escapedValue = escapeHtml(part.value)
      return `<span style="background-color: ${color}; text-decoration: ${textDecoration}; font-weight: ${fontWeight}">${escapedValue}</span>`
    }).join('')
  }
}
