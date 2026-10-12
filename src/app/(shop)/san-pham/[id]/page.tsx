import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/ProductDetail'
import { productInfo } from '@/lib/product-info'
import { getProduct, getProducts } from '@/lib/products'
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site'

export const revalidate = 60

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProduct(params.id)
  if (!p) return { title: 'Không tìm thấy sản phẩm', robots: { index: false } }
  const price = p.price ? ` Giá ${p.price.toLocaleString('vi-VN')}đ.` : ''
  const desc = `${p.name_vi} – ${p.brand}, từ Ca cao Trọng Đức (Đồng Nai).${price} Đặt hàng online, giao toàn quốc.`
  const url = `/san-pham/${p.id}`
  return {
    title: p.name_vi,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: 'website', siteName: SITE_NAME, locale: 'vi_VN', url, title: p.name_vi, description: desc,
      // Ảnh sản phẩm chỉ 440×330 (WebP) nên dùng ảnh chia sẻ chung 1200×630 để Zalo/Facebook hiển thị chắc chắn
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: p.name_vi, type: 'image/jpeg' }],
    },
    twitter: { card: 'summary_large_image', title: p.name_vi, description: desc, images: [OG_IMAGE] },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const p = await getProduct(params.id)
  if (!p) notFound()
  const info = productInfo(p, 'vi')
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name_vi,
    brand: { '@type': 'Brand', name: p.brand },
    image: `${SITE_URL}${p.image}`,
    url: `${SITE_URL}/san-pham/${p.id}`,
    ...(info.weight ? { weight: info.weight } : {}),
    ...(p.price
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'VND',
            price: p.price,
            availability: p.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${SITE_URL}/san-pham/${p.id}`,
          },
        }
      : {}),
  }
  return (
    <>
      <ProductDetail product={p} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    </>
  )
}
