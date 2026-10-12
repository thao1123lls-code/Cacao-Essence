'use client'
import { useShop } from './ShopContext'

const D = '/images/dich-vu/'

const ITEMS = [
  {
    f: 'thu-mua-che-bien',
    vi: ['Thu mua chế biến và sản xuất sản phẩm cacao', 'Ngoài cung cấp cây giống cacao, công ty còn chuyên thu mua, chế biến và sản xuất các loại sản phẩm từ trái cacao, giúp bà con nông dân ở Đồng Nai yên tâm trồng cacao.'],
    en: ['Buying, processing and making cacao products', 'Besides supplying cacao seedlings, the company buys, processes and makes a range of products from cacao pods, so Dong Nai farmers can grow cacao with confidence.'],
  },
  {
    f: 'cay-giong',
    vi: ['Cung cấp cây giống cacao', 'Ngoài các sản phẩm từ cacao, công ty còn cung cấp cây giống cacao cho người nông dân. Cây được ươm mầm thành cây con, bảo đảm các quy trình chăm sóc đúng kỹ thuật.'],
    en: ['Cacao seedlings', 'Besides cacao products, the company supplies cacao seedlings to farmers. Seedlings are raised from sprouts to young trees following proper care procedures.'],
  },
  {
    f: 'trai-nghiem',
    vi: ['Trải nghiệm cacao', 'Trạm dừng chân của Công ty TNHH Cacao Trọng Đức thu hút du khách đến tham quan vườn cacao vào mùa thu hoạch, với trái chín trĩu cành, để hòa mình vào thiên nhiên tươi mát và không khí trong lành.'],
    en: ['Cacao experience', 'The Trong Duc Cacao stop draws visitors to tour the cacao farm in harvest season, with ripe pods weighing down the branches, and to immerse themselves in fresh nature and clean air.'],
  },
  {
    f: 'xuat-khau',
    vi: ['Xuất khẩu các sản phẩm cacao', 'Công ty TNHH Cacao Trọng Đức chuyên xuất khẩu các mặt hàng cacao sang các nước như Nhật Bản, Hàn Quốc, Nga.'],
    en: ['Exporting cacao products', 'Trong Duc Cacao Co., Ltd. exports cacao products to countries such as Japan, South Korea and Russia.'],
  },
  {
    f: 'mon-an',
    vi: ['Các món ăn từ cacao', 'Cacao sữa đá, kem cacao, cacao cà phê, hạt cacao nibs kết hợp trái cây.'],
    en: ['Cacao treats', 'Iced milk cacao, cacao ice cream, cacao coffee and cacao nibs paired with fruit.'],
  },
]

const TXT = {
  vi: { eb: 'Hoạt động của chúng tôi', h: 'Dịch vụ nổi bật', s: 'Từ cây giống, thu mua chế biến đến trải nghiệm vườn và xuất khẩu, Cacao Trọng Đức đồng hành cùng người trồng cacao Đồng Nai.' },
  en: { eb: 'What we do', h: 'Featured services', s: 'From seedlings and processing to farm visits and export, Trong Duc Cacao supports Dong Nai’s cacao growers.' },
}

export default function Services() {
  const { L } = useShop()
  const l = TXT[L]
  return (
    <section id="services" className="tint svc">
      <div className="wrap">
        <p className="eyebrow">{l.eb}</p>
        <h2>{l.h}</h2>
        <p className="sub">{l.s}</p>
        <ul className="svc-grid">
          {ITEMS.map((it) => {
            const [title, text] = it[L]
            return (
              <li key={it.f}>
                <article className="svc-card">
                  <div className="svc-img"><img src={`${D}${it.f}.webp`} alt="" width={400} height={200} loading="lazy" /></div>
                  <div className="svc-body"><h3>{title}</h3><p>{text}</p></div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
