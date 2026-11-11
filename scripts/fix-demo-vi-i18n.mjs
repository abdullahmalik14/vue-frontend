/**
 * Fill missing demo.* VI keys and translate EN-identical VI demo strings.
 * Run: node scripts/fix-demo-vi-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const enPath = path.join(root, 'public/i18n/section-dashboard-global/en.json');
const viPath = path.join(root, 'public/i18n/section-dashboard-global/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

function setByPath(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function deepMergeMissing(target, source) {
  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {};
      deepMergeMissing(target[k], v);
    } else if (!(k in target)) {
      target[k] = v;
    }
  }
}

if (!vi.demo) vi.demo = {};
deepMergeMissing(vi.demo, {
  profileComponents: en.demo.profileComponents,
  homeComponents: en.demo.homeComponents,
});
if (!vi.demo.page) vi.demo.page = {};
if (!vi.demo.page.sections) vi.demo.page.sections = {};
if (!vi.demo.page.sections.shoppingCartDescription) {
  vi.demo.page.sections.shoppingCartDescription =
    en.demo.page.sections.shoppingCartDescription;
}

/** path (under demo.) → Vietnamese */
const demoVi = {
  'page.sections.dashboardTextInput': 'DashboardTextInput',
  'page.sections.heading': 'Tiêu đề',
  'page.sections.paragraph': 'Đoạn văn',
  'page.sections.cloudflareSuccess': 'CloudflareSuccess',
  'page.sections.cookies': 'Cookie',
  'page.sections.spinner': 'Spinner',
  'page.sections.shoppingCartDescription':
    'Thành phần giỏ hàng tương tác, điều khiển bằng sự kiện tùy chỉnh. Mở console để xem lệnh tương tác.',
  'page.mediaCards.video': 'Video',

  'heading.labels.h1Primary': 'h1 — defaultPrimaryHeading',
  'heading.labels.h2Secondary': 'h2 — defaultSecondaryHeading',
  'heading.labels.h3Section': 'h3 — sectionHeading',
  'heading.labels.h2Dashboard': 'h2 — dashboardHeading',
  'heading.labels.h2Auth': 'h2 — AuthHeading',
  'heading.labels.h4Form': 'h4 — formHeading',
  'heading.labels.h1Demo': 'h1 — demoHeadings',
  'heading.labels.h3Demo': 'h3 — demoHeadings',
  'heading.labels.orderHeading': 'h1 — orderHeading',

  'dashboardTextInput.email': 'Email',
  'baseTextInput.variations.textarea': 'Vùng văn bản',
  'baseTextInput.fields.emailPlaceholder': 'Email...',
  'validationShowcase.titles.url': 'URL',
  'validationShowcase.labels.email': 'Email (isEmail)',

  'buttons.sections.checkout': 'Thanh toán / mua hàng / popup giỏ hàng',
  'buttons.sections.profileMedia': 'Hồ sơ / media',
  'buttons.sections.payoutSettings': 'Cài đặt thanh toán',
  'buttons.sections.planSharing': 'Chia sẻ gói',
  'buttons.sections.mediaUploader': 'Trình tải media',
  'buttons.sections.dashboardAnalytics': 'Phân tích bảng điều khiển',
  'buttons.sections.eventsAddons': 'Sự kiện / tiện ích / lịch',
  'buttons.sections.twoPieceButton': 'TwoPieceButton — biến thể',
  'buttons.labels.authSignIn': 'authPink — size lg — đăng nhập/đăng ký',
  'buttons.labels.authTransparentSocial': 'authTransparent — size lg — mạng xã hội',
  'buttons.labels.checkoutProceed': 'checkoutProceedpayment — thanh toán/mua ngay',
  'buttons.labels.actionGreenX': 'actionGreen — mua với tư cách khách',
  'buttons.labels.profileBack': 'profileMediaBtn — popup ProfileViewAll',
  'buttons.labels.payoutSave': 'none + custom — PayoutSettings bước 2/3',
  'buttons.labels.sendInvite': 'simpleBtn — PlanSharing',
  'buttons.labels.addTier': 'polygonLeft — Thêm bậc',
  'buttons.labels.polygonNext': 'polygonLeft — Tiếp (bật + tắt)',
  'buttons.labels.submitMedia': 'polygonLeft — Gửi',
  'buttons.labels.allOrders': 'none + custom — bảng đơn hàng',
  'buttons.labels.trend': 'none + custom — thẻ chỉ số',
  'buttons.labels.newEvents': 'none + custom — SỰ KIỆN MỚI',
  'buttons.labels.publishSchedule': 'polygonLeft — XUẤT BẢN LỊCH',
  'buttons.labels.addonService': 'none + custom — dịch vụ bổ sung',
  'buttons.labels.addonServiceV2': 'none + custom — dịch vụ bổ sung v2',
  'buttons.labels.twoPieceLinkX': 'link-x — Cài đặt',
  'buttons.labels.twoPiecePremium': 'premium-upgrade — Cài đặt',
  'buttons.labels.twoPiecePink': 'link-x (pink) — Chỉnh sửa hồ sơ',
  'buttons.authSignIn': 'Đăng nhập',
  'buttons.continueWithX': 'Tiếp tục với X (Twitter)',
  'buttons.continueWithTelegram': 'Tiếp tục với Telegram',
  'buttons.proceedPayment': 'Tiến hành thanh toán',
  'buttons.back': 'Quay lại',
  'buttons.save': 'LƯU',
  'buttons.sendInvite': 'Gửi lời mời',
  'buttons.addTier': 'Thêm bậc',
  'buttons.next': 'Tiếp',
  'buttons.submitMediaForApproval': 'GỬI MEDIA ĐỂ DUYỆT',
  'buttons.allOrders': 'Tất cả đơn hàng',
  'buttons.trend': 'Xu hướng',
  'buttons.newEvents': 'SỰ KIỆN MỚI',
  'buttons.publishSchedule': 'XUẤT BẢN LỊCH',
  'buttons.addonService': 'dịch vụ bổ sung',
  'buttons.linkYourXAccount': 'Liên kết tài khoản X',
  'buttons.upgradeToPremium': 'Nâng cấp Premium',
  'buttons.unlockPremiumVideos': 'Nâng cấp Premium để tải video',

  'showCodeToggle.showCode': 'Hiện mã',
  'showCodeToggle.hideCode': 'Ẩn mã',
  'showCodeToggle.copy': 'Sao chép',
  'showCodeToggle.copied': '✓ Đã sao chép',
  'showCodeToggle.vueLabel': 'Vue',

  'lazySizes.lazyImageTitle': 'Lazy <img> (data-src)',
  'spinner.colorBrandPink': 'Hồng thương hiệu',
  'spinner.colorPrimary': 'Xanh chính',
  'spinner.colorInk': 'Mực / chữ sáng chính',
  'spinner.analyticsBlue': 'Xanh chính',

  'quillEditor.placeholders.default': 'Mô tả...',
  'quillEditor.placeholders.tierDescription': 'Mô tả bậc...',
  'quillEditor.placeholders.eventDescription': 'Mô tả sự kiện...',
  'quillEditor.placeholders.bio': 'Viết tiểu sử của bạn...',
  'quillEditor.initialContent.simple':
    '<p><strong>Xin chào!</strong> Đây là nội dung đã tải sẵn.</p>',
  'quillEditor.initialContent.rich':
    '<p><strong>Chào mừng!</strong> Chỉnh sửa <em>mô tả bậc</em> này bằng thanh công cụ.</p><ul><li>Đậm, nghiêng và liên kết</li><li>Danh sách có thứ tự và dấu đầu dòng</li></ul><p><a href="#">Liên kết mẫu</a></p>',

  'checkboxGroup.sectionTitle': 'CheckboxGroup',
  'checkboxGroup.sections.checkoutDark': 'Thanh toán — Phần tối',
  'checkboxGroup.sections.dashboard': 'Bảng điều khiển',
  'checkboxGroup.sections.mediaSubscription': 'Trình tải media — Đăng ký P2V',
  'checkboxGroup.sections.calendarEventDropdown': 'Lịch — Menu sự kiện',
  'checkboxGroup.sections.bookingStep2': 'Đặt lịch — Yêu cầu bổ sung',
  'checkboxGroup.sections.trailer': 'Trình tải media — Trailer',
  'checkboxGroup.planMedia.meta16': '16 Media',
  'checkboxGroup.planMedia.meta24': '24 Media',
  'checkboxGroup.planMedia.meta3': '3 Media',
  'checkboxGroup.mediaSubmit.item0':
    'Tất cả cá nhân xuất hiện trong nội dung tôi đang tải lên Fansocial (Nội dung):',
  'checkboxGroup.mediaSubmit.item1':
    'Tôi đã xác minh, lưu giữ và hiện đang nắm giữ mọi giấy tờ tùy thân theo Yêu cầu lưu hồ sơ, 18 U.S.C. 2257 và 28 C.F.R. 75, hoặc luật áp dụng ở các khu vực pháp lý khác (tài liệu 2257), cho mọi cá nhân xuất hiện trong Nội dung.',
  'checkboxGroup.mediaSubmit.item2':
    'Nội dung không vi phạm Điều khoản dịch vụ của Fansocial và các chính sách liên quan, bao gồm nhưng không giới hạn Chính sách chống CSAM hoặc Chính sách chống bóc lột tình dục — tôi đã đọc và đồng ý rõ ràng.',
  'checkboxGroup.calendarMain.showExistingEvents': 'Hiện sự kiện/lịch đặt hiện có',
  'checkboxGroup.bookingStep2.allowFanRecord': 'Cho phép fan ghi lại phiên',
  'checkboxGroup.bookingStep2.allowPersonalRequest': 'Cho phép yêu cầu cá nhân',
  'checkboxGroup.bookingStep2.allowFanRecordTooltip':
    'Nếu bật, fan có thể mua bản ghi phiên làm tiện ích. Bản ghi gồm toàn bộ video của creator và có sau khi đặt lịch kết thúc.',
  'checkboxGroup.bookingStep2.allowPersonalRequestTooltip':
    'Nếu bật, fan có thể thêm yêu cầu cá nhân trong biểu mẫu. Bạn có thể xem và điều chỉnh giá trước khi xác nhận.',
  'checkboxGroup.adjustEvent.cosplay': 'Cosplay',
  'checkboxGroup.adjustEvent.topless': 'Topless',
  'checkboxGroup.tags.publishedTier': 'Bậc đã xuất bản',
  'checkboxGroup.tags.draft': 'Bản nháp',

  'checkboxSwitch.sectionTitle': 'CheckboxSwitch',
  'checkboxSwitch.sections.mediaPublish': 'Trình tải media — Xuất bản & chia sẻ',
  'checkboxSwitch.sections.mediaSubscription': 'Trình tải media — Đăng ký P2V',
  'checkboxSwitch.sections.trailerSettings': 'Trình tải media — Cài đặt trailer',
  'checkboxSwitch.sections.videoThumbnail': 'Trình tải media — Chọn ảnh thu nhỏ video',
  'checkboxSwitch.sections.planDetail': 'Gói — Chi tiết gói',
  'checkboxSwitch.sections.planSharing': 'Gói — Chia sẻ gói',
  'checkboxSwitch.sections.profileViewAll': 'Hồ sơ — Popup xem tất cả',
  'checkboxSwitch.sections.editProfile': 'Chỉnh sửa hồ sơ — Cài đặt chia sẻ',
  'checkboxSwitch.sections.bookingXRepost': 'Đặt lịch — Cài đặt đăng lại X',
  'checkboxSwitch.sections.twitterRepostPopup': 'Popup cài đặt đăng lại Twitter',
  'checkboxSwitch.sections.devDemo': 'Trang Demo Dev',
  'checkboxSwitch.editProfile.postToXTips': 'Đăng lên X khi nhận tip',

  'notificationCard.sectionTitle': 'NotificationCard',
  'notificationCard.sections.devDemo': 'Trang Demo Dev',
  'notificationCard.sections.mediaPreviewToast': 'Trình tải media — Cài đặt xem trước (Toast)',
  'notificationCard.sections.bookingCalendar': 'Đặt lịch — Biểu mẫu đặt lịch thống nhất',
  'notificationCard.sections.tipStep2': 'Tip — Bước tip 2',
  'notificationCard.sections.bookingUnified':
    'Đặt lịch — Biểu mẫu thống nhất (Người đăng ký đang hoạt động)',
  'notificationCard.alt.alert': 'Cảnh báo',
  'notificationCard.alt.chevronLeft': 'Tiếp',
  'notificationCard.devDemo.activeSubscribersTitle':
    'Bạn có 3 người đăng ký đang hoạt động ở bậc này',
  'notificationCard.devDemo.activeSubscribersDescription':
    'Thay đổi chi tiết gói có thể ảnh hưởng phí và quyền lợi của người đăng ký hiện tại.',
  'notificationCard.devDemo.learnMore': 'Tìm hiểu thêm',
  'notificationCard.devDemo.successTitle': 'Thao tác hoàn tất thành công',
  'notificationCard.devDemo.successDescription': 'Tất cả hệ thống đang hoạt động bình thường.',
  'notificationCard.devDemo.errorTitle': 'Thanh toán thất bại',
  'notificationCard.devDemo.errorDescription':
    'Vui lòng cập nhật thông tin thanh toán để tiếp tục.',
  'notificationCard.devDemo.infoTitle': 'Lưu ý',
  'notificationCard.devDemo.infoDescription': 'Chúng tôi đã cập nhật điều khoản dịch vụ.',
  'notificationCard.mediaPreviewSettings.trailerReviewTitle':
    'Media của bạn sẽ được xét duyệt vì bạn đã tải lên trailer mới.',
  'notificationCard.bookingCalendar.title':
    'Bạn đang xem cài đặt đặt lịch ở chế độ lịch sự kiện cá nhân.',
  'notificationCard.bookingCalendar.description':
    'Để xem trước lịch đặt trên hồ sơ, hãy mở xem trước lịch đặt.',
  'notificationCard.tipStep2.limitExceededTitle':
    'Giá trị nhập vượt mức tối đa (14.000 token)',
  'notificationCard.tipStep2.setToMax': 'Đặt mức tối đa',
  'notificationCard.bookingUnified.activeSubscribersTitle':
    'Bạn có 3 người đăng ký đang hoạt động ở bậc này',
  'notificationCard.bookingUnified.activeSubscribersDescription':
    'Thay đổi chi tiết gói có thể ảnh hưởng phí và quyền lợi của người đăng ký hiện tại.',
  'notificationCard.bookingStep1.validationTitle': 'Lỗi xác thực',
  'notificationCard.bookingStep1.validationDescription': 'Tiêu đề là bắt buộc.',
  'notificationCard.planDetail.featuredTierTitle':
    'Bậc ‘VIP Lounge’ của bạn sẽ không còn là bậc nổi bật.',
  'notificationCard.planDetail.featuredTierDescription':
    'Bậc này sẽ được cập nhật thành bậc nổi bật trên hồ sơ sau khi lưu.',
  'notificationCard.withdrawEarnings.payoutAcceptedTitle':
    'Yêu cầu thanh toán của bạn đã được chấp nhận.',

  'checkoutReusable.sectionTitle': 'Thành phần tái sử dụng thanh toán',
  'checkoutReusable.sections.mediaPreview': 'CheckoutMediaPreview — Popup đăng ký đăng nhập',
  'checkoutReusable.sections.sectionHeader': 'SectionHeader — Đăng ký / thanh toán giỏ hàng',
  'checkoutReusable.sections.orderSummaryToggle':
    'SectionToggleHeader — Thanh toán giỏ hàng (TÓM TẮT ĐƠN)',
  'checkoutReusable.sections.paymentToggle':
    'SectionToggleHeader không thu gọn — Quy trình mua (PHƯƠNG THỨC THANH TOÁN)',
  'checkoutReusable.sections.addressCard': 'AddressCard — Thanh toán giỏ hàng đăng nhập',
  'checkoutReusable.sections.planDropdown': 'BasePlanDropdown — Mua / thanh toán giỏ (Tối)',
  'checkoutReusable.sections.orderSummary': 'OrderSummary — Giỏ / mua khách',
  'checkoutReusable.sections.paymentCompact': 'PaymentMethodLoggedIn — Quy trình mua (Gọn)',
  'checkoutReusable.sections.paymentLarge':
    'PaymentMethodLoggedIn — Quy trình mua / đặt lịch fan (Lớn)',
  'checkoutReusable.sections.paymentNotLoggedIn':
    'PaymentMethodNotLoggedIn — Quy trình mua (max-width)',
  'checkoutReusable.sections.subscriptionDefault':
    'SubscriptionPlanCard — Đăng ký đăng nhập (Mặc định)',
  'checkoutReusable.sections.subscriptionUpdate':
    'SubscriptionPlanCard — Cập nhật đăng ký (Hiện tại / Mới)',
  'checkoutReusable.sections.subscriptionNew':
    'SubscriptionPlanCard — Quy trình mua (biến thể new)',
  'checkoutReusable.sections.notesWithAvatars':
    'CheckoutNotes — Thanh toán giỏ (showAvatars true)',
  'checkoutReusable.sections.notesWithoutAvatars':
    'CheckoutNotes — Đăng ký đăng nhập (showAvatars false)',
  'checkoutReusable.sections.notesGuest': 'CheckoutNotes — Mua khách / đơn đăng ký',
  'checkoutReusable.sections.totalAmount': 'TotalAmountRow — Tất cả popup thanh toán',
  'checkoutReusable.sections.accountEmail': 'SectionToggleHeader — Tip bước 3 (EMAIL TÀI KHOẢN)',
  'checkoutReusable.sections.topUpPayment':
    'SectionToggleHeader thu gọn — Nạp bước 2 (PHƯƠNG THỨC THANH TOÁN)',
  'checkoutReusable.sections.addressTopUp': 'AddressCard — Nạp / Tip (Thanh toán đã lưu)',
  'checkoutReusable.mediaPreview.description':
    'Đăng ký ngay để mở khóa ngay hơn 300 tài nguyên media cao cấp.',
  'checkoutReusable.sectionHeader.title': 'EMAIL TÀI KHOẢN',
  'checkoutReusable.orderSummary.title': 'TÓM TẮT ĐƠN HÀNG',
  'checkoutReusable.payment.title': 'PHƯƠNG THỨC THANH TOÁN',
  'checkoutReusable.planDropdown.country': 'Quốc gia',
  'checkoutReusable.planDropdown.state': 'Bang / tỉnh',
  'checkoutReusable.subscription.footerBillingCycle':
    'Tư cách thành viên sẽ cập nhật trong chu kỳ thanh toán tiếp theo (xx-xx-xxxx)',
  'checkoutReusable.subscription.footerCheckoutStart':
    'Đăng ký bắt đầu ngay khi bạn hoàn tất thanh toán. Chu kỳ thanh toán bắt đầu (02-26-2025).',
  'checkoutReusable.paymentLoggedIn.deleteCard': 'Xóa thẻ',
  'checkoutReusable.paymentLoggedIn.cardHolderName': 'Tên chủ thẻ',
  'checkoutReusable.paymentLoggedIn.expiryDate': 'Ngày hết hạn',
  'checkoutReusable.paymentLoggedIn.noName': 'Chưa có tên',
  'checkoutReusable.paymentLoggedIn.expiryPlaceholder': 'MM/YY',
  'checkoutReusable.paymentLoggedIn.expPrefix': 'HSD',
  'checkoutReusable.paymentNotLoggedIn.saveCard': 'Lưu thẻ này để thanh toán nhanh hơn.',
  'checkoutReusable.paymentNotLoggedIn.cardNumber': 'Số thẻ',
  'checkoutReusable.paymentNotLoggedIn.expirationDate': 'Ngày hết hạn',
  'checkoutReusable.paymentNotLoggedIn.cardholderName': 'Tên chủ thẻ',
  'checkoutReusable.paymentNotLoggedIn.cvv': 'CVV',
  'checkoutReusable.notes.title': 'Ghi chú',
  'checkoutReusable.notes.optional': 'Tùy chọn',
  'checkoutReusable.notes.placeholder': "Nhập ghi chú tới {'@'}jenny1234....",
  'checkoutReusable.notes.charactersLeft': 'Còn {count} ký tự',
  'checkoutReusable.totalAmount.label': 'Tổng',
  'checkoutReusable.options.hongKong': 'Hồng Kông',
  'checkoutReusable.options.australia': 'Úc',
  'checkoutReusable.options.usa': 'Hoa Kỳ',
  'checkoutReusable.options.florida': 'Florida',
  'checkoutReusable.options.hawaii': 'Hawaii',
  'checkoutReusable.options.newYork': 'New York',
  'checkoutReusable.options.unitedStates': 'Hoa Kỳ',
  'checkoutReusable.options.canada': 'Canada',
  'checkoutReusable.options.unitedKingdom': 'Vương quốc Anh',
  'checkoutReusable.options.california': 'California',
  'checkoutReusable.options.texas': 'Texas',

  'mediaUploaderComponents.sectionTitle': 'Thành phần hỗ trợ trình tải media',
  'mediaUploaderComponents.sections.searchTags':
    'MediaUploaderSearchInput — Chi tiết media (Thẻ)',
  'mediaUploaderComponents.sections.searchCoPerformer':
    'MediaUploaderSearchInput — Chi tiết media (Đồng diễn)',
  'mediaUploaderComponents.sections.searchInviteList':
    'MediaUploaderSearchInput — Chia sẻ gói (Danh sách mời)',
  'mediaUploaderComponents.sections.publishDatePicker':
    'PublishDatePicker — Xuất bản & chia sẻ (Lịch)',
  'mediaUploaderComponents.sections.postPreview': 'PostPreview — Xuất bản & chia sẻ',
  'mediaUploaderComponents.sections.socialPreviewThumbnail':
    'SocialCustomPreview — Xuất bản & chia sẻ (Ảnh thu nhỏ)',
  'mediaUploaderComponents.sections.socialPreviewTrailer':
    'SocialCustomPreview — Xuất bản & chia sẻ (Trailer)',
  'mediaUploaderComponents.sections.thumbnailUploaderDefault':
    'ThumbnailUploader — Cài đặt xem trước (Tải ảnh thu nhỏ)',
  'mediaUploaderComponents.sections.thumbnailUploaderTrailer':
    'ThumbnailUploader — Cài đặt xem trước (Tải trailer riêng)',
  'mediaUploaderComponents.sections.thumbnailUploaderImage':
    'ThumbnailUploader — Xuất bản & chia sẻ (Ảnh thu nhỏ)',
  'mediaUploaderComponents.sections.thumbnailUploaderVideo':
    'ThumbnailUploader — Xuất bản & chia sẻ (File trailer)',
  'mediaUploaderComponents.sections.thumbnailUploaderTier':
    'ThumbnailUploader — Popup thêm bậc',
  'mediaUploaderComponents.sections.thumbnailUploaderNayTwitter':
    'ThumbnailUploaderNay — Cài đặt đăng lại Twitter',
  'mediaUploaderComponents.sections.thumbnailUploaderNayBooking':
    'ThumbnailUploaderNay — Đặt lịch bước 1 (Ảnh sự kiện)',
  'mediaUploaderComponents.sections.videoThumbnailSelector':
    'VideoThumbnailSelector — Cài đặt xem trước (Chọn ảnh chụp)',
  'mediaUploaderComponents.sections.thumbnailSelector':
    'ThumbnailSelector — Bộ chọn ảnh thu nhỏ video (con)',
  'mediaUploaderComponents.sections.blurEffect':
    'BlurEffect — Bộ chọn ảnh thu nhỏ video (con)',
  'mediaUploaderComponents.sections.uploadThumbnailPreview':
    'UploadThumbnailPreview — Cài đặt xem trước (Tải ảnh thu nhỏ)',
  'mediaUploaderComponents.sections.systemGeneratedImage':
    'SystemGeneratedImage — Cài đặt xem trước (Hệ thống tạo)',
  'mediaUploaderComponents.sections.uploadYourOwnTrailer':
    'UploadYourOwnTrailer — Cài đặt xem trước (Tải riêng)',
  'mediaUploaderComponents.sections.fileUploadPlaceholder':
    'FileUploadPlaceholder — Cài đặt xem trước (Dùng placeholder)',
  'mediaUploaderComponents.sections.trailerSettingScreenshot':
    'TrailerSetting — Cài đặt xem trước (Ảnh chụp)',
  'mediaUploaderComponents.sections.trailerSettingPlaceholder':
    'TrailerSetting — Cài đặt xem trước (Placeholder)',
  'mediaUploaderComponents.sections.trailerSettingUpload':
    'TrailerSetting — Cài đặt xem trước (Tải lên)',
  'mediaUploaderComponents.sections.addTierPopup':
    'AddTierPopup — Đăng ký & P2V (Thêm bậc)',
  'mediaUploaderComponents.sections.preorderInput':
    'DashboardTextInput — Xuất bản & chia sẻ (Đặt trước USD)',
  'mediaUploaderComponents.search.tags.title': 'Thẻ',
  'mediaUploaderComponents.search.tags.subtitle': 'Thêm tối đa 10 thẻ cho media của bạn.',
  'mediaUploaderComponents.search.tags.placeholder': 'Tìm thẻ...',
  'mediaUploaderComponents.search.coPerformer.title': 'Đồng diễn',
  'mediaUploaderComponents.search.coPerformer.subtitle':
    'Nếu media có người khác, hãy gắn thẻ họ bên dưới.',
  'mediaUploaderComponents.search.inviteList.subtitle': 'Danh sách mời',
  'mediaUploaderComponents.search.inviteList.placeholder': 'Tìm fan theo tên người dùng...',
  'mediaUploaderComponents.publishDatePicker.label': 'Đặt ngày và giờ xuất bản:',
  'mediaUploaderComponents.publishDatePicker.message': 'Ngày phải trước tối thiểu 2 ngày.',
  'mediaUploaderComponents.socialPreview.thumbnailLabel': 'Ảnh thu nhỏ',
  'mediaUploaderComponents.socialPreview.trailerLabel': 'Trailer',
  'mediaUploaderComponents.thumbnailUploader.trailerSubtitle':
    'hoặc kéo và thả tệp video vào đây',
  'mediaUploaderComponents.thumbnailUploader.trailerFileInfo':
    'MP4, AVI, MOV, WEBM, JPEG, PNG. (Tối đa 2000MB)',
  'mediaUploaderComponents.thumbnailUploader.imageSubtitle':
    'hoặc kéo và thả ảnh thu nhỏ',
  'mediaUploaderComponents.thumbnailUploader.imageFileInfo':
    'SVG, PNG, JPG hoặc GIF (tối đa 800x400px)',
  'mediaUploaderComponents.thumbnailUploader.videoSubtitle':
    'hoặc kéo và thả tệp trailer',
  'mediaUploaderComponents.thumbnailUploader.videoFileInfo':
    'MP3, MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG. (Tối đa 2000MB)',
  'mediaUploaderComponents.thumbnailUploader.tierTitle': 'Nhấp vào đây',
  'mediaUploaderComponents.thumbnailUploader.tierSubtitle':
    'để chọn ảnh hoặc kéo và thả ảnh vào đây',
  'mediaUploaderComponents.thumbnailUploader.tierFileInfo':
    '(Định dạng: JPEG, PNG. Tối đa: 10MB)',
  'mediaUploaderComponents.thumbnailUploaderNay.clickToUpload': 'Nhấp để tải lên',
  'mediaUploaderComponents.thumbnailUploaderNay.dropText': ' hoặc kéo và thả',
  'mediaUploaderComponents.thumbnailUploaderNay.twitterAllowedTypes': 'SVG, PNG, JPG hoặc GIF',
  'mediaUploaderComponents.thumbnailUploaderNay.twitterMaxSize': '800x400px',
  'mediaUploaderComponents.thumbnailUploaderNay.bookingDropText':
    'hoặc kéo và thả tệp ảnh vào đây',
  'mediaUploaderComponents.thumbnailUploaderNay.bookingAllowedTypes': 'PNG hoặc JPG (tối đa 10MB)',
  'mediaUploaderComponents.tags.list.apple': 'Táo',
  'mediaUploaderComponents.tags.list.april': 'Tháng Tư',
  'mediaUploaderComponents.tags.list.bigSmile': 'Nụ cười lớn',
  'mediaUploaderComponents.tags.list.bigEnergy': 'Năng lượng lớn',
  'mediaUploaderComponents.tags.list.cantonese': 'Quảng Đông',
  'mediaUploaderComponents.tags.list.chinese': 'Trung Quốc',
  'mediaUploaderComponents.tags.list.dumplings': 'Há cảo',
  'mediaUploaderComponents.tags.list.hello': 'Xin chào',
  'mediaUploaderComponents.planSharing.userOne': 'Người dùng Một',
  'mediaUploaderComponents.planSharing.userTwo': 'Người dùng Hai',

  'actionMenuDropdown.sectionTitle': 'ActionMenuDropdown',
  'bookingAdjustment.sectionTitle': 'BookingAdjustmentPopup',
  'premiumOrders.sectionTitle': 'PremiumOrdersTable',
  'premiumOrders.dropdownAlt': 'Menu thả xuống',
  'ordersReceived.badges.ordersReceived': 'Đơn đã nhận',
  'uploadingProgressBar.sectionTitle': 'UploadingProgressBar',
  'dashProfileSettings.sectionTitle': 'DashProfileSettings',
  'dashProfileSettings.cards.creator': 'Creator',
  'dashProfileSettings.cards.vendor': 'Vendor',
  'dashProfileSettings.cards.fan': 'Fan',
  'dashProfileSettings.cards.agent': 'Agent',
  'radioGroup.sectionTitle': 'RadioGroup',
  'calendarChat.sectionTitle': 'CalendarChat',
  'calendarChat.cards.newMessage': 'Tin nhắn mới',
  'calendarChat.cards.chatSection': 'Phần trò chuyện',
  'calendarChat.cards.adjustCostBooking': 'Điều chỉnh chi phí đặt lịch',
  'calendarChat.cards.callSoonChat': 'Trò chuyện sắp gọi',

  'subscriptionCards.sectionTitle': 'Thẻ đăng ký',
  'subscriptionCards.labels.card1': 'Thẻ 1 — Tiêu chuẩn',
  'subscriptionCards.labels.card2Featured': 'Thẻ 2 — Nổi bật',
  'subscriptionCards.labels.card3Current': 'Thẻ 3 — Đăng ký hiện tại',
  'subscriptionCards.labels.card4': 'Thẻ 4 — Tiêu chuẩn',
  'subscriptionCards.labels.card5': 'Thẻ 5 — Tiêu chuẩn',
  'subscriptionCards.cards.description':
    'Xem toàn bộ nội dung ăn xoài của tôi! Cập nhật hàng tuần!<br><br>• Nội dung 100% thật<br>• không chỉnh sửa<br>• Nội dung 100% thật<br>• không chỉnh sửa<br>• Nội dung 100% thật<br>• không chỉnh sửa<br>• Nội dung 100% thật<br>• không chỉnh sửa',
  'subscriptionCards.features.freeTokens':
    '<span class="font-semibold text-[#FF0066]">10 token miễn phí</span> mỗi tháng',
  'subscriptionCards.features.merchandise':
    '<span class="font-semibold text-[#FF0066]">Giảm 10%</span> mọi hàng hóa',
  'subscriptionCards.features.customRequest':
    '<span class="font-semibold text-[#FF0066]">Giảm 10%</span> mọi yêu cầu tùy chỉnh',
  'subscriptionCards.features.payToView':
    '<span class="font-semibold text-[#FF0066]">Giảm 10%</span> mọi video Pay to View',

  'settingsComponents.sectionTitle': 'Thành phần trang Cài đặt',
  'settingsComponents.items.buttonsAll': 'DashboardPrimaryButton — QUAY LẠI / HỦY / LƯU',
  'editProfileComponents.sectionTitle': 'Thành phần trang Chỉnh sửa hồ sơ',
  'authCodeInput.sectionTitle': 'AuthCodeInput',

  // profileComponents (were missing)
  'profileComponents.sectionTitle': 'Thành phần phần Hồ sơ',
  'profileComponents.sectionDescription':
    'Tất cả 18 thành phần hồ sơ đã kiểm tra, hiển thị đúng cách dùng thực từ ProfileWrapper.vue trên nền tối kiểu hero (assetMap + i18n).',
  'profileComponents.badges.desktop': 'Máy tính',
  'profileComponents.badges.mobileOnly': 'Chỉ mobile (<768px)',
  'profileComponents.badges.always': 'Luôn hiện',
  'profileComponents.groups.header': 'Nhóm tiêu đề',
  'profileComponents.groups.hero': 'Nhóm Hero / Meta',
  'profileComponents.groups.sharing': 'Mô tả & chia sẻ',
  'profileComponents.groups.cta': 'Đăng ký & hành động bên phải',
  'profileComponents.groups.cards': 'Tab media & thẻ',
  'profileComponents.groups.subscription': 'Băng chuyền đăng ký',
  'profileComponents.notes.mobileOnly':
    'Thành phần này chỉ hiện ở chiều rộng mobile (<768px). Thu nhỏ cửa sổ để xem trước.',
  'profileComponents.notes.wide':
    'Dùng bố cục rộng cố định (min-width 45rem) — cuộn ngang để thấy đủ nút.',
  'profileComponents.notes.tall':
    'Băng chuyền chiều cao đầy đủ, đúng như trên trang hồ sơ thật.',
  'profileComponents.data.pollTitle': 'Tôi nên ăn gì cho livestream tối nay?',
  'profileComponents.data.pollOptionOrange': 'Cam',
  'profileComponents.data.pollOptionApple': 'Táo',
  'profileComponents.data.pollOptionChicken': 'Gà',
  'profileComponents.data.pollTimeLeft': 'Còn 24 giờ để bình chọn',
  'profileComponents.data.feedDescription':
    'Jenny đã trở lại! Tối nay tôi sẽ ăn chủ yếu trái cây. -> 8pm EST 👅!',
  'profileComponents.data.mediaTitle': 'Xây dựng đội ngũ thành công nhờ hợp tác',
  'profileComponents.data.mediaAlt': 'Video {n}',
  'profileComponents.data.mediaTimeAgo': '2 giờ trước',
  'profileComponents.data.mediaTabPayToView': 'Trả để xem',
  'profileComponents.data.mediaTabSubscription': 'Đăng ký',
  'profileComponents.data.merchTitle': 'Áo top (đã giặt) — Xoài yêu thích của Jenny!',
  'profileComponents.data.merchDescription':
    'Mua xoài yêu thích của Jenny! Nhanh tay khi còn hàng! Mua xoài yêu thích của Jenny! Nhanh tay khi còn hàng! Mua xoài yêu thích của Jenny! Nhanh tay khi còn hàng!',
  'profileComponents.data.merchDiscount': 'GIẢM 10%',
  'profileComponents.data.merchTitleOutOfStock': 'Hết hàng',
  'profileComponents.data.merchDescriptionOutOfStock': 'Sản phẩm này đã hết hàng.',

  // homeComponents (were missing)
  'homeComponents.sectionTitle': 'Thành phần trang Chủ',
  'homeComponents.sectionDescription':
    'Tất cả 9 thành phần home đã kiểm tra, hiển thị đúng cách dùng từ HomePage.vue và homeSections (assetMap + i18n). Show Code chỉ có trên demo này.',
  'homeComponents.badges.homePage': 'HomePage',
  'homeComponents.badges.heroSection': 'HeroSection',
  'homeComponents.badges.joinSection': 'JoinSection',
  'homeComponents.badges.aboutFaq': 'Giới thiệu / FAQ / v.v.',
  'homeComponents.badges.aboutSection': 'AboutSection',
  'homeComponents.badges.serviceTabs': 'ServiceTabsSection',
  'homeComponents.badges.sliders': 'Gallery / Xem nhiều / Gần đây',
  'homeComponents.groups.shell': 'Khung trang',
  'homeComponents.groups.hero': 'Nhóm Hero',
  'homeComponents.groups.blocks': 'Khối xây dựng phần',
  'homeComponents.groups.media': 'Thanh trượt media',
  'homeComponents.notes.backgroundVideo':
    'Lớp full-bleed tuyệt đối trên HomePage. Demo bọc trong khung cao cố định để thấy được ở đây.',
  'homeComponents.notes.heroCluster':
    'Cặp giống HeroSection.vue — lời giới thiệu + form đăng ký creator.',
  'homeComponents.notes.mediaSlider':
    "Cùng dạng dữ liệu như GallerySlider.vue (getAssetUrls + t('home.sliders.*')).",

  // social linking (new)
  'socialLinking.title': 'Liên kết tài khoản mạng xã hội',
  'socialLinking.description':
    'Liên kết tài khoản mạng xã hội để đăng nhập một chạm sau này.',
  'socialLinking.loading': 'Đang tải dữ liệu hồ sơ...',
  'socialLinking.notLinked': 'Chưa liên kết',
  'socialLinking.linkedId': 'Đã liên kết (ID: {id})',
  'socialLinking.unlink': 'Hủy liên kết',
  'socialLinking.linkAccount': 'Liên kết tài khoản',
  'socialLinking.twitter': 'X (Twitter)',
  'socialLinking.telegram': 'Telegram',

  'baseInput.sectionTitle': 'BaseInput',
  'baseTextInput.sectionTitle': 'BaseTextInput',
  'authComponent.sectionTitle': 'AuthTextInput — Demo trực tiếp',
};

for (const [k, v] of Object.entries(demoVi)) {
  setByPath(vi.demo, k, v);
}

// Card demos on DemoPage (outside demo.*)
const cardVi = {
  'mediaCard.demo.creators.creatorAllen': 'Creator Allen',
  'mediaCard.demo.creators.mistressJessica': 'Mistress Jessica',
  'mediaCard.demo.titles.walkInPark': 'Đi dạo trong công viên.',
  'mediaCard.demo.titles.walkInParkToday': 'Hôm nay đi dạo trong công viên.',
  'mediaCard.demo.titles.walkInParkMorning': 'Sáng nay đi dạo trong công viên',
  'mediaCard.demo.titles.mySecondComingSoon': 'Phần 2 sắp ra mắt',
  'mediaCard.demo.titles.morningWorkout': 'Buổi tập buổi sáng',
  'mediaCard.demo.tags.subscriberExclusive': 'Dành riêng người đăng ký',
  'mediaCard.demo.tags.subscribeOrBuy': 'Đăng ký hoặc mua',
  'mediaCard.demo.tags.free': 'Miễn phí',
  'mediaCard.demo.tags.subOnly': 'Chỉ đăng ký',
  'mediaCard.demo.timeAgo.fiveMonths': '5 tháng',
  'mediaCard.demo.timeAgo.twoDays': '2 ngày',

  'tierCard.demo.plans.oneDay': '1 ngày',
  'tierCard.demo.plans.oneMonth': '1 tháng',
  'tierCard.demo.plans.sixMonth': '6 tháng',
  'tierCard.demo.plans.oneYear': '1 năm',
  'tierCard.demo.footer.claimOffer': 'NHẬN<br>ƯU ĐÃI',
  'tierCard.demo.footer.subscribe': 'ĐĂNG KÝ',
  'tierCard.demo.footer.fiveLeft': 'Còn 5!',
  'tierCard.demo.footer.ninetyFiveLeft': 'Còn 95!',
  'tierCard.demo.footer.offerProgressLow': 'Ưu đãi 95/100',
  'tierCard.demo.footer.offerProgressHigh': 'Ưu đãi 5/100',
  'tierCard.demo.footer.spendMore': 'Chi thêm $200 để nhận',
  'tierCard.demo.footer.spendProgress': '200/ USD400',

  'eventCard.demo.titles.subscriberDiscount': 'Giảm giá người đăng ký',
  'eventCard.demo.titles.luckyDraw': 'Quay số may mắn!',
  'eventCard.demo.spendMoreClaim': 'Chi thêm $200 để nhận',
  'eventCard.demo.spendMoreEnter': 'Chi thêm $200 để tham gia',
  'eventCard.demo.offersLeft': 'Còn 10 ưu đãi!',
  'eventCard.demo.chancesLeft': 'Còn 5 cơ hội!',
  'eventCard.demo.progressOffer': 'Ưu đãi 95/100',
  'eventCard.demo.endsIn': 'Kết thúc trong',
  'eventCard.demo.buttons.claimDiscount': 'NHẬN GIẢM GIÁ',
  'eventCard.demo.buttons.enterLuckyDraw': 'THAM GIA QUAY SỐ',
};

for (const [k, v] of Object.entries(cardVi)) {
  setByPath(vi, k, v);
}

// Ensure EN has socialLinking + section titles for parity
const enDemoExtra = {
  'socialLinking.title': 'Social Account Linking',
  'socialLinking.description':
    'Link your social media accounts to enable one-click login in the future.',
  'socialLinking.loading': 'Loading profile data...',
  'socialLinking.notLinked': 'Not linked',
  'socialLinking.linkedId': 'Linked (ID: {id})',
  'socialLinking.unlink': 'Unlink',
  'socialLinking.linkAccount': 'Link Account',
  'socialLinking.twitter': 'X (Twitter)',
  'socialLinking.telegram': 'Telegram',
  'baseInput.sectionTitle': 'BaseInput',
  'baseTextInput.sectionTitle': 'BaseTextInput',
  'authComponent.sectionTitle': 'AuthTextInput — Live Demo',
};
for (const [k, v] of Object.entries(enDemoExtra)) {
  setByPath(en.demo, k, v);
}

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p));
    else out[p] = v;
  }
  return out;
}
const fe = flatten(en.demo);
const fv = flatten(vi.demo);
const missing = Object.keys(fe).filter((k) => !(k in fv));
const identical = Object.keys(fe).filter((k) => k in fv && fv[k] === fe[k]);
console.log('demo missing VI:', missing.length);
console.log('demo identical EN=VI:', identical.length);
console.log('done');
