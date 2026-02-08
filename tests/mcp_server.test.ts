import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../src/index'
import { CloudflareBindings } from '../src/types'

// Mock D1 Database
const mockD1 = {
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      all: vi.fn(),
      first: vi.fn(),
      run: vi.fn(),
    })),
    all: vi.fn(),
    first: vi.fn(),
    run: vi.fn(),
  })),
}

const mockBindings: CloudflareBindings = {
  DB: mockD1 as any,
  IMAGES_BUCKET: {} as any,
  STRIPE_SECRET_KEY: 'sk_test_123',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
  STRIPE_WEBHOOK_SECRET: 'whsec_123',
  PAYPAL_CLIENT_ID: 'sb',
  PAYPAL_CLIENT_SECRET: 'sb',
  PAYPAL_MODE: 'sandbox',
  PAYPAL_WEBHOOK_ID: 'foo',
  RESEND_API_KEY: 're_123',
  FROM_EMAIL: 'test@example.com',
  BASE_URL: 'http://localhost:8787',
  MCP_API_KEY: 'secret-mcp-key',
}

describe('MCP Server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Explicitly restore default implementation to avoid leakage
    mockD1.prepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(),
        first: vi.fn(),
        run: vi.fn(),
      })),
      all: vi.fn(),
      first: vi.fn(),
      run: vi.fn(),
    } as any))
  })

  it('should return 401 if no API key is provided', async () => {
    const res = await app.request('/api/mcp', {
      method: 'GET',
    }, mockBindings)
    expect(res.status).toBe(401)
  })

  it('should return 401 if API key is invalid', async () => {
    const res = await app.request('/api/mcp', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer wrong-key',
      },
    }, mockBindings)
    expect(res.status).toBe(401)
  })

  it('should return 200 (or initiate connection) if API key is valid', async () => {
    // Note: The WebStandardStreamableHTTPServerTransport handles GET by starting an SSE stream?
    // Or it might expect a specific header.
    // Let's see what happens with a simple GET.
    const res = await app.request('/api/mcp', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer secret-mcp-key',
        'Accept': 'text/event-stream',
      },
    }, mockBindings)

    // We expect it to handle the request.
    // If it's SSE, it might return 200 with text/event-stream.
    if (res.status !== 200) {
      console.log('GET Error:', await res.text())
    }
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/event-stream')
  })

  it('should handle JSON-RPC POST request for tools/list', async () => {
    const rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    }

    const res = await app.request('/api/mcp?sessionId=test-session', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer secret-mcp-key',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify(rpcRequest),
    }, mockBindings)

    if (res.status !== 200) {
      console.log('POST Error:', await res.text())
    }
    expect(res.status).toBe(200)

    // Parse SSE response
    const text = await res.text()
    // Simple parsing: find the line starting with "data:"
    const dataLine = text.split('\n').find(line => line.startsWith('data: '))
    expect(dataLine).toBeDefined()
    const data = JSON.parse(dataLine!.substring(6))

    expect(data).toHaveProperty('result')
    expect(data.result).toHaveProperty('tools')
    // We defined 4 tools
    expect(data.result.tools).toHaveLength(4)
  })

  it('should execute search_stories tool', async () => {
    // Mock DB response
    const mockResults = [{ id: 1, title: 'Test Story', slug: 'test-story', excerpt: 'Foo' }]

    // Override implementation for this test
    mockD1.prepare.mockImplementation(() => ({
      bind: vi.fn(() => ({
        all: vi.fn().mockResolvedValue({ results: mockResults }),
        first: vi.fn(),
        run: vi.fn(),
      })),
      all: vi.fn(),
      first: vi.fn(),
      run: vi.fn(),
    } as any))

    const rpcRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'search_stories',
        arguments: { query: 'test' },
      },
    }

    const res = await app.request('/api/mcp?sessionId=test-session', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer secret-mcp-key',
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify(rpcRequest),
      }, mockBindings)

    if (res.status !== 200) {
        console.log('Tool Error:', await res.text())
    }
    expect(res.status).toBe(200)

    // Parse SSE response
    const text = await res.text()
    const dataLine = text.split('\n').find(line => line.startsWith('data: '))
    expect(dataLine).toBeDefined()
    const data = JSON.parse(dataLine!.substring(6))

    expect(data.result.content[0].text).toContain('Test Story')
  })
})
