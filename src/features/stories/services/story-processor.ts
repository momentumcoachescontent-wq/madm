import { dbRun } from '../../../models/db'
import { getStory } from '../models/stories'
import { sanitizeHtml } from '../../../lib/sanitize'
import * as cheerio from 'cheerio'

export const processStoryApproval = async (db: D1Database, bucket: R2Bucket, storyId: number) => {
  console.log(`[StoryProcessor] Processing approval for story ${storyId}`)

  // 1. Fetch story
  const story = await getStory(db, storyId)
  if (!story) {
    console.error(`[StoryProcessor] Story ${storyId} not found`)
    return
  }

  // 2. Fetch content from R2
  if (!story.r2_key) {
    console.error(`[StoryProcessor] Story ${storyId} has no R2 key`)
    return
  }

  let rawHtml = ''
  try {
    const object = await bucket.get(story.r2_key)
    if (!object) {
      console.error(`[StoryProcessor] R2 object ${story.r2_key} not found`)
      return
    }
    rawHtml = await object.text()
  } catch (e) {
    console.error(`[StoryProcessor] Error fetching R2 object:`, e)
    return
  }

  // 3. Sanitize (security cleanup)
  // Use existing sanitizeHtml (removes scripts, iframes, dangerous attributes)
  const cleanHtml = sanitizeHtml(rawHtml)

  // 4. Load into Cheerio for extraction and further processing
  const $ = cheerio.load(cleanHtml)

  // Remove ALL links (keep text)
  $('a').each((_, el) => {
    $(el).replaceWith($(el).text())
  })

  // 5. Extract Metadata

  // Title: meta madm:title > title > Story Meta Title > Untitled
  const title =
    $('meta[name="madm:title"]').attr('content') ||
    $('title').text() ||
    story.meta_title ||
    'Untitled Story'

  // Author: meta madm:author > alias > Anonymous
  const author =
    $('meta[name="madm:author"]').attr('content') ||
    story.submitter_alias ||
    'Anónimo'

  // Story Text: section[data-madm="story"] > body
  let storyText = ''
  const storySection = $('section[data-madm="story"]')
  if (storySection.length > 0) {
    storyText = storySection.text().trim()
  } else {
    // If we fallback to body, we should ideally exclude analysis if it exists separately
    const bodyClone = $('body').clone()
    bodyClone.find('section[data-madm="analysis"]').remove()
    storyText = bodyClone.text().trim()
  }

  // Analysis
  const analysisSection = $('section[data-madm="analysis"]')
  const analysisText = analysisSection.length > 0 ? analysisSection.text().trim() : null

  // Excerpt
  let excerpt =
    $('meta[name="madm:excerpt"]').attr('content') ||
    $('meta[name="description"]').attr('content')

  if (!excerpt) {
    const trimmed = storyText?.trim() ?? ''
    excerpt = trimmed ? trimmed.substring(0, 200).trim() + (trimmed.length > 200 ? '...' : '') : ''
  }

  // Thumbnail
  const thumbnail =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="madm:thumbnail"]').attr('content')

  // Slug: Generate random string (UUID)
  const slug = crypto.randomUUID()

  // 6. Update Database
  // We update the processed fields
  const query = `
    UPDATE stories
    SET
      slug = ?,
      story_text = ?,
      analysis_text = ?,
      excerpt = ?,
      thumbnail_url = ?,
      meta_title = ?,
      meta_author = ?,
      published_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `

  await dbRun(db, query, [
    slug,
    storyText,
    analysisText,
    excerpt,
    thumbnail,
    title,
    author,
    storyId
  ])

  console.log(`[StoryProcessor] Processed story ${storyId}. Slug: ${slug}`)
}
