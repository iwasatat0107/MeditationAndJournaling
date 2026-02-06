import type { NextConfig } from 'next'

describe('next.config.ts セキュリティヘッダー', () => {
  let nextConfig: NextConfig

  beforeAll(async () => {
    const mod = await import('../next.config')
    nextConfig = mod.default
  })

  it('headers 関数が定義されている', () => {
    expect(nextConfig.headers).toBeDefined()
    expect(typeof nextConfig.headers).toBe('function')
  })

  describe('セキュリティヘッダーの値', () => {
    let headers: { key: string; value: string }[]

    beforeAll(async () => {
      const result = await nextConfig.headers!()
      expect(result).toHaveLength(1)
      expect(result[0].source).toBe('/(.*)')
      headers = result[0].headers
    })

    it('Strict-Transport-Security が設定されている', () => {
      const hsts = headers.find(h => h.key === 'Strict-Transport-Security')
      expect(hsts).toBeDefined()
      expect(hsts!.value).toBe('max-age=31536000; includeSubDomains')
    })

    it('X-Content-Type-Options が設定されている', () => {
      const xcto = headers.find(h => h.key === 'X-Content-Type-Options')
      expect(xcto).toBeDefined()
      expect(xcto!.value).toBe('nosniff')
    })

    it('X-Frame-Options が設定されている', () => {
      const xfo = headers.find(h => h.key === 'X-Frame-Options')
      expect(xfo).toBeDefined()
      expect(xfo!.value).toBe('DENY')
    })

    it('Referrer-Policy が設定されている', () => {
      const rp = headers.find(h => h.key === 'Referrer-Policy')
      expect(rp).toBeDefined()
      expect(rp!.value).toBe('strict-origin-when-cross-origin')
    })
  })
})
