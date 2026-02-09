import { describe, it, expect } from 'vitest'

describe('Sample Test Suite', () => {
  it('should pass - basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })

  it('should pass - string comparison', () => {
    expect('hello').toBe('hello')
  })

  it('should pass - array includes', () => {
    const fruits = ['apple', 'banana', 'orange']
    expect(fruits).toContain('banana')
  })
})
