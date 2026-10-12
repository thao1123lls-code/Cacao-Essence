import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'
import { SITE_URL } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    ...products.map((p) => ({ url: `${SITE_URL}/san-pham/${p.id}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ]
}
