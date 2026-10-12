/** Địa chỉ gốc của website (dùng cho og:image, canonical, sitemap). Đặt NEXT_PUBLIC_SITE_URL khi triển khai. */
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || fromVercel || 'http://localhost:3000').replace(/\/$/, '')
export const SITE_NAME = 'Cacao Origin'
export const SITE_TITLE = 'Cacao Origin – Trọng Đức Cacao | Bản sắc từ hạt đến quà'
export const SITE_DESC =
  'Cacao Origin – Bản sắc từ hạt đến quà. Bột cacao Vinchoco và sô-cô-la Bungo từ Ca cao Trọng Đức, Đồng Nai. Đặt hàng online, giao toàn quốc.'
/** Ảnh chia sẻ 1200×630, để JPG vì Zalo/Facebook hiển thị ổn định hơn WebP. */
export const OG_IMAGE = '/images/og-cover.jpg'
