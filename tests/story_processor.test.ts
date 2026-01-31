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

    // Find update call: look for ID=1 at the end (index 7)
    const updateArgs = bindCalls.find(args => args[7] === 1 && args.length === 8)

    expect(updateArgs).toBeDefined()
    if (updateArgs) {
      const [slug, storyText, analysisText, excerpt, thumbnail, title, author, id] = updateArgs as any[]

      expect(slug).toBeDefined()
      // Use toContain because of possible whitespace issues
      expect(storyText).toContain('This is the story content.')
      expect(analysisText).toContain('Analysis content.')
      expect(excerpt).toBe('Extracted Excerpt')
      expect(thumbnail).toBe('https://example.com/thumb.jpg')
      expect(title).toBe('Extracted Title')
      expect(author).toBe('Extracted Author')
      expect(id).toBe(1)
    }
  })

  it('should fallback correctly when metadata is missing', async () => {
    const mockStory = {
      id: 2,
      r2_key: 'story-key-2',
      submitter_alias: null,
      meta_title: null
    }

    const htmlContent = `
      <html>
        <body>
          <p>Body text only.</p>
          <section data-madm="analysis">
             Analysis content should be excluded from body text.
          </section>
        </body>
      </html>
    `

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

    const mockDb = { prepare: prepareMock }
    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue(htmlContent)
      })
    }

    await processStoryApproval(mockDb as any, mockBucket as any, 2)

    const bindCalls = bindMock.mock.calls
    const updateArgs = bindCalls.find(args => args[7] === 2 && args.length === 8)

    expect(updateArgs).toBeDefined()
    if (updateArgs) {
      const [_, storyText, analysisText, excerpt, _thumb, title, author] = updateArgs as any[]

      // Story text should be body text excluding analysis
      expect(storyText.trim()).toBe('Body text only.')
      // Excerpt should be generated from story text
      expect(excerpt).toBe('Body text only.')
      // Analysis extracted separately
      expect(analysisText.trim()).toContain('Analysis content')
      // Fallbacks
      expect(title).toBe('Untitled Story')
      expect(author).toBe('Anónimo')
    }
  })

  it('should handle empty story text for excerpt', async () => {
    const mockStory = {
      id: 3,
      r2_key: 'story-key-3'
    }

    // Empty body
    const htmlContent = `<html><body></body></html>`

    const bindMock = vi.fn().mockImplementation((...args) => {
      return {
        first: vi.fn().mockResolvedValue(mockStory),
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        all: vi.fn().mockResolvedValue([])
      }
    })

    const prepareMock = vi.fn().mockReturnValue({ bind: bindMock })
    const mockDb = { prepare: prepareMock }
    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue(htmlContent)
      })
    }

    await processStoryApproval(mockDb as any, mockBucket as any, 3)

    const bindCalls = bindMock.mock.calls
    const updateArgs = bindCalls.find(args => args[7] === 3 && args.length === 8)

    expect(updateArgs).toBeDefined()
    if (updateArgs) {
      const [_, storyText, _analysis, excerpt] = updateArgs as any[]
      expect(storyText).toBe('')
      expect(excerpt).toBe('') // Should not be undefined
    }
  })
})
