import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Cormorant_Garamond, Playfair_Display } from 'next/font/google'
import { OG_IMAGE, SITE_DESC, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site'

const serif = Playfair_Display({ subsets: ['latin', 'vietnamese'], weight: ['500', '600', '700', '800'], style: ['normal', 'italic'], variable: '--f-serif', display: 'swap' })
const script = Cormorant_Garamond({ subsets: ['latin', 'vietnamese'], weight: ['500', '600'], style: ['normal', 'italic'], variable: '--f-script', display: 'swap' })
const sans = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'], variable: '--f-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: ['cacao', 'ca cao', 'bột cacao', 'Vinchoco', 'sô-cô-la', 'Bungo', 'Trọng Đức Cacao', 'quà tặng Đồng Nai', 'OCOP'],
  authors: [{ name: 'Công ty TNHH Cacao Trọng Đức' }],
  creator: 'Công ty TNHH Cacao Trọng Đức',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
    url: '/',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Cacao Origin – Bột cacao Vinchoco và sô-cô-la Bungo', type: 'image/jpeg' }],
  },
  twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESC, images: [OG_IMAGE] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  // Favicon: dùng quy ước file của Next → src/app/favicon.ico, icon.png, apple-icon.png (tự sinh thẻ <link>)
}
export const viewport: Viewport = { themeColor: '#5a2a17', width: 'device-width', initialScale: 1, viewportFit: 'cover' }

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Công ty TNHH Cacao Trọng Đức',
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.webp`,
  telephone: '+842513629168',
  taxID: '3600798643',
  address: { '@type': 'PostalAddress', streetAddress: 'Số 12, Khu dân cư 16, Ấp 4, Xã Phú Hòa', addressRegion: 'Đồng Nai', addressCountry: 'VN' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${serif.variable} ${script.variable} ${sans.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  )
}
