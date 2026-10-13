import type { Lang } from './i18n'

/**
 * Nội dung TÓM TẮT 6 chính sách ở chân trang (hiện trong modal).
 * Chủ shop cần rà soát lại các con số trong POLICY_CFG và câu chữ cho đúng quy định thực tế trước khi công bố.
 * Mục chưa có số liệu chính thức được diễn đạt chung, chưa cam kết con số cụ thể.
 */
export const POLICY_CFG = {
  hotline: '0965.72.4545',
  hotlineHref: 'tel:0965724545',
  /** Thời hạn báo lỗi/sai hàng kể từ khi nhận hàng — TODO: xác nhận với chủ shop */
  reportHours: 48,
}

export interface PolicyDoc { lead: string; points: string[]; note?: string }

const H = POLICY_CFG.reportHours

/** Thứ tự 1–6 khớp với khóa i18n pol1…pol6 (tiêu đề lấy từ đó). */
export const POLICIES: Record<Lang, PolicyDoc[]> = {
  vi: [
    {
      lead: 'Đặt hàng trực tiếp trên website chỉ với vài bước.',
      points: [
        'Chọn sản phẩm và bấm “Thêm vào giỏ”, hoặc tự đóng hộp quà sô-cô-la ở mục Quà tặng.',
        'Mở giỏ hàng, kiểm tra số lượng rồi bấm đặt hàng.',
        'Nhập họ tên, số điện thoại, địa chỉ nhận hàng và chọn hình thức thanh toán.',
        'Sau khi đặt, website hiển thị mã đơn hàng. Cacao Essence liên hệ qua số điện thoại bạn cung cấp khi cần xác nhận đơn.',
        'Sản phẩm chưa niêm yết giá: bấm “Nhận báo giá”, hỏi chatbot hoặc gọi hotline.',
      ],
      note: `Cần hỗ trợ đặt hàng? Gọi ${POLICY_CFG.hotline}.`,
    },
    {
      lead: 'Cacao Essence giao hàng cẩn thận và hỗ trợ đổi trả khi sản phẩm có lỗi.',
      points: [
        'Thời gian giao dự kiến phụ thuộc địa chỉ nhận hàng và thời điểm đặt (dịp lễ, Tết có thể lâu hơn); nhân viên sẽ báo khi xác nhận đơn.',
        'Phí giao hàng theo đơn vị vận chuyển và được thông báo trước khi bạn đồng ý đơn.',
        `Nếu sản phẩm lỗi, hư hỏng do vận chuyển hoặc giao sai, hãy báo trong vòng ${H} giờ kể từ khi nhận hàng, kèm ảnh hoặc video để được đổi hoặc hoàn tiền.`,
        'Sản phẩm thực phẩm đã mở bao bì hoặc đã sử dụng không áp dụng đổi trả, trừ trường hợp lỗi từ nhà sản xuất.',
      ],
      note: 'Vui lòng giữ nguyên bao bì và mã đơn hàng khi yêu cầu đổi trả.',
    },
    {
      lead: 'Hai hình thức thanh toán được hỗ trợ khi đặt hàng.',
      points: [
        'Thanh toán khi nhận hàng (COD): trả tiền mặt cho người giao khi nhận sản phẩm.',
        'Chuyển khoản: chọn “Chuyển khoản” khi đặt hàng, Cacao Essence sẽ cung cấp thông tin tài khoản khi xác nhận đơn. Hiện website chưa thanh toán trực tuyến qua cổng thanh toán.',
        'Giá hiển thị bằng đồng Việt Nam (đ). Tổng tiền cuối cùng do hệ thống tính lại khi bạn đặt hàng.',
      ],
      note: 'Chỉ chuyển khoản theo thông tin do Cacao Essence cung cấp trực tiếp; hãy gọi hotline nếu bạn nhận được yêu cầu chuyển tiền đáng ngờ.',
    },
    {
      lead: 'Cacao Essence giao hàng đi các tỉnh thành trên cả nước qua đơn vị vận chuyển đối tác.',
      points: [
        'Sản phẩm được đóng gói cẩn thận, hạn chế ẩm và va đập trong quá trình vận chuyển.',
        'Sô-cô-la dễ mềm hoặc chảy khi trời nóng: hãy cho biết nếu bạn cần gói chống nóng hoặc giao nhanh.',
        'Phí giao hàng và thời gian giao dự kiến tùy khu vực, được báo khi xác nhận đơn; khu vực xa có thể cần thêm thời gian.',
        'Bạn có thể dùng mã đơn hàng để hỏi tình trạng đơn qua hotline.',
      ],
    },
    {
      lead: 'Thông tin của bạn chỉ được dùng để phục vụ đơn hàng.',
      points: [
        'Thông tin thu thập: họ tên, số điện thoại, địa chỉ và ghi chú đơn hàng.',
        'Mục đích: xử lý, giao hàng, xác nhận đơn và chăm sóc sau bán.',
        'Không bán hoặc chia sẻ cho bên thứ ba, trừ đơn vị vận chuyển hoặc thanh toán khi cần để hoàn tất đơn hàng của bạn.',
        'Dữ liệu được lưu trong hệ thống có phân quyền, chỉ nhân sự được cấp quyền mới xem được.',
        'Cacao Essence không bao giờ hỏi mật khẩu hay mã OTP của bạn.',
      ],
      note: `Muốn xem, chỉnh sửa hoặc xóa thông tin đã gửi? Gọi ${POLICY_CFG.hotline}.`,
    },
    {
      lead: 'Bạn được kiểm tra hàng ngay khi nhận.',
      points: [
        'Kiểm tra kiện hàng còn nguyên vẹn, đúng sản phẩm, đủ số lượng và còn niêm phong trước khi ký nhận.',
        'Nên quay video khi mở kiện hàng để làm căn cứ nếu có sai sót.',
        `Nếu phát hiện lỗi hoặc sai hàng, báo ngay hoặc trong vòng ${H} giờ để được hỗ trợ theo chính sách đổi trả.`,
        'Kiểm tra hạn sử dụng ghi trên bao bì khi nhận hàng.',
      ],
    },
  ],
  en: [
    {
      lead: 'Ordering on the website takes just a few steps.',
      points: [
        'Pick a product and tap “Add to cart”, or build your own chocolate gift box in the Gifts section.',
        'Open your cart, check the quantities, then place the order.',
        'Enter your name, phone number and delivery address, and choose a payment method.',
        'After ordering you will see an order code. Cacao Essence may call the number you provided to confirm the order.',
        'For products without a listed price, tap “Get a quote”, ask the chatbot or call our hotline.',
      ],
      note: `Need help ordering? Call ${POLICY_CFG.hotline}.`,
    },
    {
      lead: 'We deliver with care and support exchanges when a product is faulty.',
      points: [
        'Estimated delivery time depends on your address and the season (holidays and Tet can take longer); our staff will tell you when confirming the order.',
        'Shipping fees follow the carrier’s rates and are shared before you agree to the order.',
        `If an item is defective, damaged in transit or wrong, tell us within ${H} hours of receiving it with a photo or video for an exchange or refund.`,
        'Opened or used food products cannot be returned, unless the fault is the manufacturer’s.',
      ],
      note: 'Please keep the original packaging and your order code when requesting a return.',
    },
    {
      lead: 'Two payment methods are supported at checkout.',
      points: [
        'Cash on delivery (COD): pay the courier in cash when you receive your order.',
        'Bank transfer: choose “Bank transfer” at checkout and Cacao Essence will send the account details when confirming. The website does not yet take online card payments.',
        'Prices are in Vietnamese dong. The final total is recalculated by our system when you place the order.',
      ],
      note: 'Only transfer money to account details provided directly by Cacao Essence, and call the hotline if you receive a suspicious payment request.',
    },
    {
      lead: 'Cacao Essence ships nationwide through partner carriers.',
      points: [
        'Products are packed carefully to limit moisture and impact in transit.',
        'Chocolate can soften or melt in hot weather: let us know if you need heat-protective packing or faster delivery.',
        'Shipping fees and delivery times vary by area and are shared when we confirm your order; remote areas may take longer.',
        'You can quote your order code to ask about its status by phone.',
      ],
    },
    {
      lead: 'Your information is used only to fulfil your order.',
      points: [
        'We collect your name, phone number, address and order notes.',
        'We use them to process, deliver and confirm orders and for after-sales care.',
        'We do not sell or share them with third parties, except carriers or payment providers where needed to complete your order.',
        'Data is stored in an access-controlled system that only authorised staff can view.',
        'Cacao Essence will never ask for your password or an OTP code.',
      ],
      note: `Want to view, correct or delete your information? Call ${POLICY_CFG.hotline}.`,
    },
    {
      lead: 'You may inspect your parcel when it arrives.',
      points: [
        'Before signing, check that the parcel is intact, contains the right items and quantities, and is still sealed.',
        'We suggest filming yourself opening the parcel in case something is wrong.',
        `If something is faulty or wrong, tell us right away or within ${H} hours so we can help under our return policy.`,
        'Check the expiry date printed on the packaging when you receive the goods.',
      ],
    },
  ],
}
