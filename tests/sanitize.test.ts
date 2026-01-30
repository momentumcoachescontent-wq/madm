import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '../src/lib/sanitize'

describe('sanitizeHtml', () => {
  it('should pass through safe HTML tags', () => {
    const input = '<p>Hello <b>World</b></p>'
    expect(sanitizeHtml(input)).toBe(input)
  })

  it('should strip script tags', () => {
    const input = '<script>alert(1)</script><p>Safe</p>'
    expect(sanitizeHtml(input)).toBe('<p>Safe</p>')
  })

  it('should strip on* attributes', () => {
    const input = '<img src="http://example.com/x.png" onerror="alert(1)" />'
    // xss might preserve self-closing style or add space
    const output = sanitizeHtml(input)
    expect(output).toContain('src="http://example.com/x.png"')
    expect(output).not.toContain('onerror')
  })

  it('should allow safe CSS properties', () => {
    const input = '<p style="color: red; text-align: center;">Hello</p>'
    const output = sanitizeHtml(input)
    // xss may normalize css (remove spaces)
    expect(output).toContain('color:red')
    expect(output).toContain('text-align:center')
  })

  it('should strip unsafe CSS properties', () => {
    const input = '<div style="position: absolute; top: 0; left: 0;">Overlay</div>'
    // position, top, left are not in our whitelist
    // xss returns <div style>Overlay</div> if style is empty
    expect(sanitizeHtml(input)).toMatch(/<div style(?:="")?>Overlay<\/div>/)
  })

  it('should strip unsafe CSS values (url)', () => {
    // If 'background-image' is not in whitelist, it should be stripped.
    const input = '<div style="background-image: url(javascript:alert(1))">Bg</div>'
    expect(sanitizeHtml(input)).toMatch(/<div style(?:="")?>Bg<\/div>/)
  })

  it('should handle mixed safe and unsafe CSS', () => {
    const input = '<p style="color: red; position: fixed;">Mixed</p>'
    const output = sanitizeHtml(input)
    expect(output).toContain('color:red')
    expect(output).not.toContain('position:fixed')
  })
})
