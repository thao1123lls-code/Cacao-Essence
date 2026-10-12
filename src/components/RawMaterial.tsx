'use client'
import { useCallback, useRef, useState } from 'react'
import { Lightbox } from './Certificates'
import { useShop } from './ShopContext'

const D = '/images/vung-nguyen-lieu/'

type Pic = { f: string; w: number; h: number; vi: string; en: string }
const GALLERY: Pic[] = [
  { f: 'vuon-uom', w: 667, h: 422, vi: 'Vườn ươm cây giống cacao', en: 'Cacao seedling nursery' },
  { f: 'qua-do', w: 412, h: 444, vi: 'Quả cacao chín đỏ', en: 'Ripe red cacao pods' },
  { f: 'qua-xanh', w: 252, h: 444, vi: 'Quả cacao xanh trên thân cây', en: 'Green pods on the trunk' },
  { f: 'ghep-canh', w: 667, h: 444, vi: 'Ghép cành tạo giống', en: 'Grafting to propagate varieties' },
  { f: 'cay-ra-qua', w: 667, h: 444, vi: 'Cây cacao đang ra quả non', en: 'Young pods forming' },
]

const TXT = {
  vi: {
    eb: 'Vùng nguyên liệu', h: 'Vùng nguyên liệu cây cacao',
    s: 'Mỗi sản phẩm bắt đầu từ vườn cacao Đồng Nai. Đây là cách cây cacao được trồng, chăm sóc và nhân giống cùng bà con nông dân.',
    p1: 'Cacao là cây công nghiệp nhiệt đới, cho hạt làm nguyên liệu của ngành thực phẩm cao cấp như sô-cô-la. Đây cũng là mặt hàng xuất khẩu có giá trị kinh tế cao nên đang được ưa chuộng. Ở Việt Nam, cacao thích hợp với nhiều vùng sinh thái: Duyên hải Nam Trung Bộ, miền Đông Nam Bộ, đồng bằng sông Cửu Long và Tây Nguyên.',
    p2: 'Cây cacao (Theobroma cacao L.) có nguồn gốc từ lưu vực sông Amazon, Nam Mỹ, rồi lan sang các nước vùng Trung và Nam Mỹ. Cacao được du nhập vào Việt Nam từ rất sớm, theo chân các nhà truyền giáo phương Tây.',
    p3: 'Đó là cây thân gỗ nhỏ, xanh quanh năm, cao khoảng 4–8 m (ngoài tự nhiên có thể tới 10–20 m). Cây ưa bóng râm và chịu bóng tốt nên thích hợp trồng xen, tiết kiệm diện tích đất. Quả to, bên trong chứa nhiều hạt nhỏ giàu dinh dưỡng, là nguyên liệu làm sô-cô-la và bột cacao.',
    capA: 'Tham quan vườn cacao', capB: 'Hướng dẫn kỹ thuật chăm sóc cây',
    eh: 'Điều kiện sinh thái của cây cacao',
    es: 'Cây cacao thích nghi rộng và không đòi hỏi kỹ thuật chăm sóc phức tạp, thường được trồng ở đất trống, đồi trọc hoặc trồng xen.',
    eco: [
      ['Khí hậu', 'Hợp khí hậu nhiệt đới nóng ẩm mưa nhiều: nhiệt độ trung bình khoảng 25 °C, độ ẩm 85%, lượng mưa trên 1.500 mm/năm. Cây ưa ánh sáng tán xạ (50–60% cường độ ánh sáng tự nhiên) nên hợp trồng dưới tán cây ăn trái hoặc cây che bóng. Trên 35 °C cây bắt đầu héo rũ, nhiệt độ quá thấp thì cây ngừng sinh trưởng.'],
      ['Đất trồng', 'Hợp nhiều loại đất (đất đỏ, đất xám, đất phù sa cổ), tốt nhất là đất có thành phần cơ giới trung bình đến nhẹ, pH 5,5–5,8, tầng canh tác dày 1–1,5 m, dễ thoát nước, giữ nước cao và giàu chất hữu cơ. Nhờ canh tác phù hợp (bón vôi, bón phân hữu cơ…), cây vẫn cho năng suất cao trên đất kém màu mỡ.'],
      ['Gió', 'Cây không hợp vùng gió mạnh vì bộ rễ khá yếu. Nếu trồng ở nơi thường có gió lớn, cần trồng thêm cây chắn gió để cây sinh trưởng và phát triển tốt.'],
      ['Nước', 'Cây thường ra hoa và đậu trái vào mùa mưa, khi tán cây đã định hình đầy đủ. Nếu mùa khô được tưới đủ nước, cây có thể ra trái quanh năm.'],
      ['Bóng che', 'Cacao ưa bóng nên rất hợp trồng xen với vườn điều, chuối hay các loại cây công nghiệp có tán thưa.'],
    ],
    dh: 'Phát triển vùng nguyên liệu',
    goal: 'Công ty TNHH Cacao Trọng Đức cùng bà con nông dân trong vùng phát triển cây cacao, từ khâu trồng, tiêu thụ sản phẩm đến sản xuất các sản phẩm cacao chất lượng và bền vững.',
    stats: [['2 ha', 'diện tích vườn ươm'], ['50.000', 'cây giống sản xuất năm 2015'], ['40 kg', 'năng suất bình quân mỗi cây mỗi năm']],
    badge: 'Vườn đầu dòng đạt chuẩn do Sở NN&PTNT tỉnh Đồng Nai cấp chứng nhận.',
    demand: 'Cây giống sản xuất năm 2015 đáp ứng nhu cầu trồng mới của bà con trong và ngoài tỉnh Đồng Nai.',
    vh: 'Các giống đang nhân',
    gh: 'Hình ảnh vùng nguyên liệu',
    view: 'Xem lớn',
  },
  en: {
    eb: 'Sourcing', h: 'Our cacao growing region',
    s: 'Every product starts in a Dong Nai cacao farm. Here is how cacao is grown, cared for and propagated together with local farmers.',
    p1: 'Cacao is a tropical industrial crop whose beans are the raw material for premium foods such as chocolate. It is also a high-value export commodity, so demand keeps growing. In Vietnam it suits many ecological regions: the South Central Coast, the Southeast, the Mekong Delta and the Central Highlands.',
    p2: 'The cacao tree (Theobroma cacao L.) originates from the Amazon basin in South America and spread across Central and South America. It reached Vietnam very early, brought by Western missionaries.',
    p3: 'It is a small, evergreen woody tree, about 4–8 m tall (10–20 m in the wild). It loves shade and tolerates it well, so it is ideal for intercropping and saves land. Its large pods hold many small, nutrient-rich beans, the raw material for chocolate and cacao powder.',
    capA: 'Visiting the cacao farm', capB: 'Technical guidance on tree care',
    eh: 'Growing conditions for cacao',
    es: 'Cacao adapts widely and needs no complex care. It is often grown on open land, bare hills or intercropped.',
    eco: [
      ['Climate', 'Suits hot, humid, rainy tropics: average temperature about 25 °C, humidity 85%, rainfall above 1,500 mm a year. It prefers diffuse light (50–60% of natural intensity), so it grows well under fruit trees or shade trees. Above 35 °C the tree wilts; if it is too cold, growth stops.'],
      ['Soil', 'Grows on many soils (red, grey and old alluvial), best on light to medium-textured soil with pH 5.5–5.8, a 1–1.5 m deep root zone, good drainage, high water retention and plenty of organic matter. With suitable practices (liming, organic fertilizer…) it can still yield well on poorer soil.'],
      ['Wind', 'The roots are fairly weak, so cacao does not suit windy areas. Where strong winds are common, windbreak trees must be planted.'],
      ['Water', 'Trees usually flower and set fruit in the rainy season, once the canopy is fully formed. With enough water in the dry season, they can bear fruit all year.'],
      ['Shade', 'Cacao likes shade, so it pairs well with cashew orchards, bananas and other industrial crops with sparse canopies.'],
    ],
    dh: 'Developing the growing region',
    goal: 'Trong Duc Cacao Co., Ltd. works with local farmers to develop cacao, from planting and buying produce to making quality, sustainable cacao products.',
    stats: [['2 ha', 'seedling nursery area'], ['50,000', 'seedlings produced in 2015'], ['40 kg', 'average yield per tree per year']],
    badge: 'Certified as a standard elite nursery by the Dong Nai Department of Agriculture and Rural Development.',
    demand: 'The seedlings produced in 2015 met new planting demand from farmers inside and outside Dong Nai province.',
    vh: 'Varieties propagated',
    gh: 'Photos from the growing region',
    view: 'View larger',
  },
}
const VARIETIES = ['TD3', 'TD5', 'TD6', 'TD7', 'TD8', 'TD9', 'TD10', 'TD11']

export default function RawMaterial() {
  const { L } = useShop()
  const l = TXT[L]
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const close = useCallback(() => { setOpen(null); opener.current?.focus() }, [])
  const items = GALLERY.map((p) => ({ src: `${D}${p.f}.webp`, w: p.w, h: p.h, title: L === 'vi' ? p.vi : p.en, sub: '' }))

  return (
    <section id="sourcing" className="rmsec">
      <div className="wrap">
        <p className="eyebrow">{l.eb}</p>
        <h2>{l.h}</h2>
        <p className="sub">{l.s}</p>

        <div className="rm-intro">
          <div className="rm-txt">
            <p>{l.p1}</p><p>{l.p2}</p><p>{l.p3}</p>
          </div>
          <figure className="rm-fig">
            <img src={`${D}tham-vuon.webp`} alt={l.capA} width={800} height={533} loading="lazy" />
            <figcaption>{l.capA}</figcaption>
          </figure>
        </div>

        <div className="rm-eco">
          <figure className="rm-fig rm-figw">
            <img src={`${D}huong-dan-ky-thuat.webp`} alt={l.capB} width={800} height={534} loading="lazy" />
            <figcaption>{l.capB}</figcaption>
          </figure>
          <div>
            <h3 className="rm-h3">{l.eh}</h3>
            <p className="rm-lead">{l.es}</p>
            <dl className="rm-cards">
              {l.eco.map(([k, v]: string[]) => (
                <div key={k} className="rm-card"><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>

        <div className="rm-dev">
          <h3 className="rm-h3">{l.dh}</h3>
          <p className="rm-lead">{l.goal}</p>
          <ul className="rm-stats">
            {l.stats.map(([b, t]: string[]) => <li key={b}><b>{b}</b><span>{t}</span></li>)}
          </ul>
          <p className="rm-note">✦ {l.badge}</p>
          <p className="rm-note">✦ {l.demand}</p>
          <p className="rm-vh">{l.vh}</p>
          <div className="chipsrow rm-var">{VARIETIES.map((v) => <span key={v}>{v}</span>)}</div>
        </div>

        <h3 className="rm-h3 rm-gh">{l.gh}</h3>
        <ul className="rm-gal">
          {GALLERY.map((p, i) => (
            <li key={p.f} className={i === 0 ? 'wide' : ''}>
              <button type="button" aria-haspopup="dialog" aria-label={`${l.view}: ${items[i].title}`} onClick={(e) => { opener.current = e.currentTarget; setOpen(i) }}>
                <img src={items[i].src} alt="" width={p.w} height={p.h} loading="lazy" />
                <span>{items[i].title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open != null && <Lightbox items={items} start={open} onClose={close} />}
    </section>
  )
}
