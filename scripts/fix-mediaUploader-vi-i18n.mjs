/**
 * Translate mediaUploader VI keys that are still English.
 * Run: node scripts/fix-mediaUploader-vi-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const viPath = path.join(root, 'public/i18n/section-dashboard-global/vi.json');
const enPath = path.join(root, 'public/i18n/section-dashboard-global/en.json');
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

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

const mediaUploaderVi = {
  'search.iconAlt': 'tìm kiếm',
  'thumbnail.label': 'Ảnh thu nhỏ',
  'trailerSetting.label': 'Hiện trailer xem trước',
  'trailerSetting.paragraph':
    'Cho phép người chưa đăng ký xem trước video trên trang chi tiết media.',
  'thumbnailUploader.title': 'Nhấp để tải lên',
  'thumbnailUploader.subtitle': 'hoặc kéo và thả tệp ảnh vào đây',
  'thumbnailUploader.fileInfo': 'PNG hoặc JPG (tối đa 10MB)',
  'thumbnailUploader.selected': 'Đã chọn',
  'thumbnailUploaderNay.cancel': 'Hủy',
  'thumbnailUploaderNay.processing': 'Đang xử lý điều tuyệt vời...',
  'thumbnailUploaderNay.maxGallery': '(tối đa: 10 tệp {size})',
  'thumbnailUploaderNay.maxSingle': '(tối đa: {size})',
  'thumbnailUploaderNay.closeAlt': 'đóng',
  'thumbnailUploaderNay.clickToUpload': 'Nhấp để tải lên',
  'thumbnailUploaderNay.dropText': ' hoặc kéo và thả',
  'blurEffect.blurAlt': 'làm mờ',
  'blurEffect.dropdownAlt': 'mũi tên menu',
  'shell.uploadMedia': 'Tải media',
  'shell.closeAlt': 'đóng',
  'shell.back': 'Quay lại',
  'shell.next': 'Tiếp',
  'shell.steps.previewSettings': 'Cài đặt xem trước',
  'shell.steps.subscriptionP2v': 'Đăng ký và P2V',
  'shell.steps.mediaDetails': 'Chi tiết media',
  'shell.steps.publishSharing': 'Cài đặt xuất bản & chia sẻ',
  'shell.steps.submit': 'Gửi',
  'subscription.settingsTitle': 'Cài đặt đăng ký',
  'subscription.linkToggle': 'Liên kết media này với gói đăng ký',
  'subscription.addTier': 'Thêm bậc',
  'subscription.payToViewTitle': 'Cài đặt trả để xem',
  'subscription.payToViewToggle': 'Cho phép media này trả để xem',
  'subscription.originalPrice': 'Giá gốc',
  'subscription.discountedPrice': 'Giá giảm (tùy chọn)',
  'subscription.originalPriceError': 'Giá phải từ USD$ 1.95 đến 500.',
  'subscription.discountPriceError': 'Giá giảm phải thấp hơn giá gốc.',
  'subscription.displayTitle': 'Hiển thị media này trên:',
  'subscription.discoveryPage': 'Trang khám phá',
  'subscription.profilePage': 'Trang hồ sơ của tôi',
  'publish.useOriginal': 'Dùng ảnh thu nhỏ và xem trước gốc',
  'publish.useCustom': 'Tải ảnh thu nhỏ và xem trước khác',
  'publish.none': 'Không đính kèm ảnh thu nhỏ và xem trước',
  'publish.postMessageLabel':
    'Tin nhắn bài đăng (Để trống để dùng tin mặc định hệ thống.)',
  'publish.postMessagePlaceholder':
    'Đừng bỏ lỡ—xem nội dung độc quyền này và là người đầu tiên trải nghiệm!',
  'publish.attachMedia': 'Đính kèm media',
  'publish.whenTitle': 'Bạn muốn xuất bản media này khi nào?',
  'publish.publishImmediately': 'Xuất bản ngay sau khi duyệt',
  'publish.schedulePublish': 'Lên lịch thời gian xuất bản',
  'publish.selectOption': 'Chọn một tùy chọn',
  'publish.immediateHelp':
    'Chúng tôi sẽ xuất bản theo tùy chọn đăng ký và trả để xem của bạn. Thường mất khoảng 2 ngày làm việc.',
  'publish.shareSettings': 'Cài đặt chia sẻ',
  'publish.postToX': 'Đăng lên X khi media được xuất bản',
  'publish.thumbnail': 'Ảnh thu nhỏ',
  'publish.trailer': 'Trailer',
  'publish.imageDropSubtitle': 'hoặc kéo và thả ảnh thu nhỏ',
  'publish.imageFileInfo': 'SVG, PNG, JPG hoặc GIF (tối đa 800x400px)',
  'publish.videoDropSubtitle': 'hoặc kéo và thả tệp trailer',
  'publish.videoFileInfo':
    'MP3, MP4, AVI, QUICKTIME, X-MATROSKA, X-MS-WMV, WEBM, OGG. (Tối đa 2000MB)',
  'publish.connectXNotice':
    'Bạn phải kết nối tài khoản X trước khi dùng tính năng tự đăng lại.',
  'publish.connectX': 'Kết nối tài khoản X',
  'publish.scheduleLabel': 'Đặt ngày và giờ xuất bản:',
  'publish.scheduleMessage': 'Ngày phải trước tối thiểu 2 ngày.',
  'publish.featureComingSoon': "Nổi bật media này ở mục 'sắp ra mắt'",
  'publish.featureComingSoonTip':
    "Media này sẽ được thêm vào mục 'sắp ra mắt' trên trang media hồ sơ.",
  'publish.preorderPrice': 'Giá đặt trước (Tùy chọn)',
  'publish.preorderBullet1': 'Ưu đãi đặc biệt cho fan đặt trước media này.',
  'publish.preorderBullet2': 'Để trống để tắt tính năng.',
  'addTier.title': 'Thêm bậc mới',
  'addTier.draftNotice':
    'Bạn đã dùng hết chỗ bậc đã xuất bản; bậc mới sẽ được lưu dưới dạng bản nháp.',
  'addTier.cancel': 'HỦY',
  'addTier.save': 'LƯU',
  'addTier.closeAlt': 'Đóng',
  'addTier.tierNamePlaceholder': 'Tên bậc...',
  'addTier.tierDescriptionPlaceholder': 'Mô tả bậc...',
  'addTier.description': 'Mô tả',
  'addTier.backgroundImage': 'Ảnh nền',
  'addTier.backgroundImageLabel': 'Ảnh nền',
  'addTier.backgroundPreviewAlt': 'xem trước nền',
  'addTier.deleteAlt': 'xóa',
  'addTier.uploadTitle': 'Nhấp vào đây',
  'addTier.uploadSubtitle': 'để chọn ảnh hoặc kéo và thả ảnh vào đây',
  'addTier.uploadFileInfo': '(Định dạng: JPEG, PNG. Tối đa: 10MB)',
  'addTier.subscriptionFee': 'PHÍ ĐĂNG KÝ',
  'addTier.freeTier': 'Bậc miễn phí',
  'addTier.paidTier': 'Bậc trả phí',
  'addTier.originalPrice': 'Giá gốc',
  'addTier.discountedPrice': 'Giá giảm (tùy chọn)',
  'addTier.originalPriceHint': 'Giá phải từ USD$ 1.95 đến 500.',
  'addTier.discountPriceHint': 'Để trống để tắt hiển thị giảm giá.',
  'addTier.subscriberBenefits': 'Quyền lợi người đăng ký',
  'addTier.optional': 'Tùy chọn',
  'addTier.freeTokens': 'Token miễn phí',
  'addTier.freeTokensTooltip':
    'Số token miễn phí cấp cho thành viên bậc này mỗi chu kỳ thanh toán. Tần suất theo cài đặt gói đăng ký cơ bản.',
  'addTier.merchDiscount': 'Giảm giá hàng hóa',
  'addTier.merchDiscountBullet1':
    "Đặt phần trăm giảm cho mọi hàng trong shop (ví dụ nhập '10' nếu muốn giảm 10%)",
  'addTier.merchDiscountBullet2': 'Để trống để tắt tính năng.',
  'addTier.payToViewDiscount': 'Giảm giá trả để xem',
  'addTier.payToViewDiscountBullet':
    "Đặt phần trăm giảm cho mọi sản phẩm trả để xem (ví dụ nhập '10' nếu muốn giảm 10%)",
  'addTier.customRequestDiscount': 'Giảm giá yêu cầu tùy chỉnh',
  'addTier.customRequestBullet1':
    "Đặt phần trăm giảm cho yêu cầu sản phẩm tùy chỉnh (ví dụ nhập '10' nếu muốn giảm 10%)",
  'addTier.customRequestBullet2': 'Để trống để tắt tính năng.',
  'addTier.unsubscribeDiscount': 'Giảm giá khi hủy đăng ký',
  'addTier.unsubscribeTooltip':
    'Số token miễn phí cấp cho thành viên bậc này mỗi chu kỳ thanh toán. Tần suất theo cài đặt gói đăng ký cơ bản.',
  'addTier.applyOnSale': 'Áp dụng cho mặt hàng đang giảm giá',
  'addTier.percentOff': '% giảm',
  'addTier.rangeError': 'Giá trị phải từ 1-99',
  'preview.thumbnailSettings': 'Cài đặt ảnh thu nhỏ',
  'preview.trailerSettings': 'Cài đặt trailer',
  'preview.chooseScreenshot': 'Chọn ảnh chụp',
  'preview.usePlaceholder': 'Dùng placeholder',
  'preview.uploadThumbnail': 'Tải ảnh thu nhỏ riêng',
  'preview.siteGeneratedTrailer': 'Dùng trailer do hệ thống tạo',
  'preview.uploadOwnTrailer': 'Tải trailer riêng',
  'preview.videoDropSubtitle': 'hoặc kéo và thả tệp video vào đây',
  'preview.videoFileInfo': 'MP4, AVI, MOV, WEBM, JPEG, PNG. (Tối đa 2000MB)',
  'preview.uploadSuccess': 'Đã tải lên video mới thành công.',
  'mediaDetails.titlePlaceholder': 'Tiêu đề video (Tùy chọn)',
  'mediaDetails.descriptionPlaceholder': 'Mô tả (Tùy chọn)',
  'mediaDetails.tagsTitle': 'Thẻ',
  'mediaDetails.tagsSubtitle': 'Thêm tối đa 10 thẻ cho media của bạn.',
  'mediaDetails.tagsPlaceholder': 'Tìm thẻ...',
  'mediaDetails.coPerformerTitle': 'Đồng diễn',
  'mediaDetails.coPerformerSubtitle':
    'Nếu media có người khác, hãy gắn thẻ họ bên dưới.',
  'submit.certifyTitle': 'Bằng cách chọn các ô bên dưới, tôi xác nhận rằng:',
  'submit.term1':
    'Tất cả cá nhân xuất hiện trong nội dung tôi đang tải lên Fansocial (Nội dung):',
  'submit.term1Bullet1': 'đồng ý xuất hiện trong Nội dung.',
  'submit.term1Bullet2': 'đồng ý để Nội dung này được tải lên.',
  'submit.term1Bullet3':
    'đã đủ ít nhất 18 tuổi tại thời điểm sản xuất Nội dung, hoặc tuổi trưởng thành theo khu vực pháp lý nơi Nội dung được sản xuất.',
  'submit.term2':
    'Tôi đã xác minh, lưu giữ và hiện đang nắm giữ mọi giấy tờ tùy thân theo Yêu cầu lưu hồ sơ, 18 U.S.C. 2257 và 28 C.F.R. 75, hoặc luật áp dụng ở các khu vực pháp lý khác (tài liệu 2257), cho mọi cá nhân xuất hiện trong Nội dung.',
  'submit.term3':
    'Tôi đã xác minh, lưu giữ và hiện đang nắm giữ mọi giấy tờ tùy thân theo Yêu cầu lưu hồ sơ, 18 U.S.C. 2257 và 28 C.F.R. 75, hoặc luật áp dụng ở các khu vực pháp lý khác (tài liệu 2257), cho mọi cá nhân xuất hiện trong Nội dung.',
  'submit.term4':
    'Nội dung không vi phạm Điều khoản dịch vụ của Fansocial và các chính sách liên quan, bao gồm nhưng không giới hạn Chính sách chống CSAM hoặc Chính sách chống bóc lột tình dục — tôi đã đọc và đồng ý rõ ràng.',
  'submit.term5':
    'Nội dung không vi phạm Điều khoản dịch vụ của Fansocial và các chính sách liên quan, bao gồm nhưng không giới hạn Chính sách chống CSAM hoặc Chính sách chống bóc lột tình dục — tôi đã đọc và đồng ý rõ ràng.',
  'submit.warning':
    'CẢNH BÁO: Tải lên (hoặc cố tải lên) nội dung vi phạm pháp luật (ví dụ: nội dung trẻ em hoặc không đồng thuận), Chính sách CSAM hoặc Chính sách chống bóc lột tình dục sẽ khiến tài khoản liên quan bị chấm dứt ngay và báo cáo cho cơ quan thực thi pháp luật.',
  'submit.submitButton': 'GỬI MEDIA ĐỂ DUYỆT',
  'submit.acceptAllAlert': 'Vui lòng chấp nhận tất cả điều khoản trước khi gửi.',
  'submit.successAlert': 'Đã gửi media thành công!',
  'submit.failAlert': 'Gửi thất bại. Vui lòng thử lại.',
  'submit.errorAlert': 'Đã xảy ra lỗi khi gửi.',
};

for (const [k, v] of Object.entries(mediaUploaderVi)) {
  setByPath(vi.mediaUploader, k, v);
}

// Auth demo extra section titles
const authExtraEn = {
  'authComponent.verificationTitle': 'Verification (OTP)',
  'authComponent.onboardingTitle': 'Onboarding — Role & Username',
};
const authExtraVi = {
  'authComponent.verificationTitle': 'Xác minh (OTP)',
  'authComponent.onboardingTitle': 'Onboarding — Vai trò & tên người dùng',
};
for (const [k, v] of Object.entries(authExtraEn)) setByPath(en.demo, k, v);
for (const [k, v] of Object.entries(authExtraVi)) setByPath(vi.demo, k, v);

// Country / lazy section demos
const countryEn = {
  'countryState.show': 'Show Component',
  'countryState.hide': 'Hide Component',
  'countryState.country': 'Country:',
  'countryState.state': 'State:',
};
const countryVi = {
  'countryState.show': 'Hiện thành phần',
  'countryState.hide': 'Ẩn thành phần',
  'countryState.country': 'Quốc gia:',
  'countryState.state': 'Bang / tỉnh:',
};
for (const [k, v] of Object.entries(countryEn)) setByPath(en.demo, k, v);
for (const [k, v] of Object.entries(countryVi)) setByPath(vi.demo, k, v);

const lazyEn = {
  'lazySection.pageTitle': 'Lazy Section Loading — live demo',
  'lazySection.intro':
    'Open DevTools → Elements (and optionally Network), then scroll down slowly. Each section below is wrapped in <LazySection>. While off-screen only an empty placeholder div exists; as you approach it, the real HTML is created into the inspector and its JS chunk is fetched in Network.',
  'lazySection.hint':
    'Tip: in the Elements panel, watch the <div class="lazy-section"> wrappers — the placeholder swaps to the real [data-lazy-block] markup on scroll.',
  'lazySection.scrollSpacer': 'Scroll down ↓ (spacer — nothing lazy here)',
  'lazySection.spacer': 'Spacer',
  'lazySection.keepScrolling': 'Keep scrolling — footer loads near the bottom ↓',
  'lazySection.placeholderA':
    'Section A — NOT loaded yet. Scroll here and watch this placeholder turn into real HTML.',
  'lazySection.placeholderB':
    'Section B — NOT loaded yet. Scroll here and watch this placeholder turn into real HTML.',
  'lazySection.placeholderC':
    'Section C (footer) — NOT loaded yet. Scroll here and watch this placeholder turn into real HTML.',
  'lazySection.end': 'End of demo.',
};
const lazyVi = {
  'lazySection.pageTitle': 'Tải phần Lazy — demo trực tiếp',
  'lazySection.intro':
    'Mở DevTools → Elements (và tùy chọn Network), rồi cuộn chậm xuống. Mỗi phần bên dưới được bọc trong <LazySection>. Khi ngoài màn hình chỉ có placeholder trống; khi bạn tới gần, HTML thật được tạo trong inspector và chunk JS được tải trong Network.',
  'lazySection.hint':
    'Mẹo: trong panel Elements, theo dõi các wrapper <div class="lazy-section"> — placeholder đổi thành markup thật [data-lazy-block] khi cuộn.',
  'lazySection.scrollSpacer': 'Cuộn xuống ↓ (khoảng trống — chưa lazy)',
  'lazySection.spacer': 'Khoảng trống',
  'lazySection.keepScrolling': 'Tiếp tục cuộn — footer tải gần cuối ↓',
  'lazySection.placeholderA':
    'Phần A — CHƯA tải. Cuộn tới đây và xem placeholder biến thành HTML thật.',
  'lazySection.placeholderB':
    'Phần B — CHƯA tải. Cuộn tới đây và xem placeholder biến thành HTML thật.',
  'lazySection.placeholderC':
    'Phần C (footer) — CHƯA tải. Cuộn tới đây và xem placeholder biến thành HTML thật.',
  'lazySection.end': 'Hết demo.',
};
for (const [k, v] of Object.entries(lazyEn)) setByPath(en.demo, k, v);
for (const [k, v] of Object.entries(lazyVi)) setByPath(vi.demo, k, v);

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2) + '\n', 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
console.log('mediaUploader + auth/country/lazy keys updated');
