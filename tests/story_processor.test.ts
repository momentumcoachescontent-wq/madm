import { describe, it, expect, vi } from 'vitest'
import { processStoryApproval } from '../src/features/stories/services/story-processor'

describe('Story Processor', () => {
  it('should process and extract metadata correctly', async () => {
    const mockStory = {
      id: 1,
      r2_key: 'story-key',
      submitter_alias: 'Old Alias',
      meta_title: 'Old Title'
    }

    const htmlContent = `
      <html>
        <head>
          <meta name="madm:title" content="Extracted Title">
          <meta name="madm:author" content="Extracted Author">
          <meta name="madm:excerpt" content="Extracted Excerpt">
          <meta property="og:image" content="https://example.com/thumb.jpg">
        </head>
        <body>
          <script>alert('xss')</script>
          <a href="https://bad.com">Link Text</a>
          <section data-madm="story">
            <p>This is the story content.</p>
          </section>
          <section data-madm="analysis">
             Analysis content.
          </section>
        </body>
      </html>
    `

    // Mock DB behavior
    const bindMock = vi.fn().mockImplementation((...args) => {
      return {
        first: vi.fn().mockResolvedValue(mockStory),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        all: vi.fn().mockResolvedValue([])
      }
    })

    const prepareMock = vi.fn().mockReturnValue({
      bind: bindMock
    })

    const mockDb = {
      prepare: prepareMock
    }

    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue(htmlContent)
      })
    }

    await processStoryApproval(mockDb as any, mockBucket as any, 1)

    // Check args passed to bind()
    const bindCalls = bindMock.mock.calls

    // Find update call: look for ID=1 at the end (index 5)
    const updateArgs = bindCalls.find(args => args[5] === 1 && args.length === 6)

    expect(updateArgs).toBeDefined()
    if (updateArgs) {
      const [slug, storyText, analysisText, excerpt, thumbnail, id] = updateArgs as any[]

      expect(slug).toBeDefined()
      // Use toContain because of possible whitespace issues
      expect(storyText).toContain('This is the story content.')
      expect(analysisText).toContain('Analysis content.')
      expect(excerpt).toBe('Extracted Excerpt')
      expect(thumbnail).toBe('https://example.com/thumb.jpg')
      expect(id).toBe(1)
    }
  })
})
