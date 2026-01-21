import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "vi" | "en";

interface LanguageState {
	language: Language;
	toggleLanguage: () => void;
	setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			language: "vi",
			toggleLanguage: () =>
				set((state) => ({
					language: state.language === "vi" ? "en" : "vi",
				})),
			setLanguage: (lang) => set({ language: lang }),
		}),
		{
			name: "language-storage",
		}
	)
);

// Translations
export const translations = {
	vi: {
		yes: "Có",
		no: "Không",
		success: "Thành công",
		error: "Lỗi",

		// Header
		home: "🏠 Trang Chủ",
		accounts: "🎮 Acc Game",
		guide: "📖 Hướng Dẫn",
		warranty: "🛡️ Bảo Hành",
		orders: "Đơn Hàng",
		login: "Đăng nhập",
		logout: "Đăng xuất",

		// Header Navigation Keys
		navHome: "Trang Chủ",
		navAccounts: "Acc Game",
		navGuide: "Hướng Dẫn",
		navWarranty: "Bảo Hành",
		navAdmin: "Admin",

		// Home
		shopBadge: "✨ Shop acc Play Together uy tín ✨",
		heroTitle1: "TienCoTruong",
		heroTitle2: "Shop 🎮💖",
		heroDescription: "🌟 Chuyên mua bán acc Play Together chất lượng cao!",
		viewAccounts: "🎮 Xem Acc Ngay",
		viewAccNow: "Xem Acc Ngay",
		registerFree: "✨ Đăng ký miễn phí",
		statTransactions: "💫 Giao dịch",
		statCustomers: "💕 Khách hàng",
		statSatisfied: "😊 Hài lòng",
		statSupport: "💬 Hỗ trợ",
		whyChooseUs: "Tại sao chọn",
		us: "chúng mình",
		whyChooseDesc:
			"Shop cam kết mang đến trải nghiệm mua acc tốt nhất cho bạn! 🌈",
		featureReliable: "🛡️ Uy tín hàng đầu",
		featureReliableDesc:
			"Hơn 10,000+ giao dịch thành công, đánh giá 5 sao từ khách hàng yêu thương",
		featureHouse: "🏡 Acc có nhà đẹp",
		featureHouseDesc:
			"Nhiều acc sở hữu nhà trang trí siêu cute, đầy đủ nội thất sang chảnh",
		featureOutfit: "👗 Outfit đa dạng",
		featureOutfitDesc:
			"Acc với hàng trăm skin, outfit limited edition và vật phẩm hiếm",
		findByPrice: "Tìm Acc theo",
		price: "Giá",
		findByPriceDesc: "Chọn khoảng giá phù hợp với túi tiền của bạn! 🎯",

		// Price Filters
		priceUnder1m: "Dưới 1 Triệu",
		price1mTo5m: "1 - 5 Triệu",
		price5mTo10m: "5 - 10 Triệu",
		price10mTo20m: "10 - 20 Triệu",
		priceAbove20m: "Trên 20 Triệu",
		filterPriceUnder1m: "Dưới 1 Triệu",
		filterPrice1mTo5m: "1 - 5 Triệu",
		filterPrice5mTo10m: "5 - 10 Triệu",
		filterPrice10mTo20m: "10 - 20 Triệu",
		filterPriceAbove20m: "Trên 20 Triệu",

		priceDescCheap: "Acc giá rẻ cho newbie",
		priceDescGood: "Acc chất lượng tốt",
		priceDescVip: "Acc VIP nhiều đồ",
		priceDescSuperVip: "Acc siêu VIP rare",
		viewAllAccounts: "Xem tất cả acc 🎮",
		readyToPlay: "Sẵn sàng chơi Play Together? 🎮💖",
		ctaDesc: "Mua acc ngay hôm nay để nhận ưu đãi đặc biệt! Hỗ trợ 24/7 ✨",
		buyAccNow: "Mua Acc Ngay",

		// Accounts Page
		accountsList: "Danh Sách",
		accGame: "Acc Game",
		accountsDesc: "Tìm kiếm và mua acc game chất lượng với giá tốt nhất",
		found: "Tìm thấy",
		accGameCount: "acc game",
		noAccountsFound: "Không tìm thấy acc game",
		tryChangeFilter: "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm",

		// Account Card
		details: "Chi tiết",

		// Account Filter
		searchPlaceholder: "Tìm kiếm acc game có mã số, tựa đề...",
		allGames: "Tất cả",
		allPrices: "Tất cả giá",
		clearFilters: "Xóa bộ lọc",

		// Account Detail
		accountNotFound: "Không tìm thấy acc game",
		accountInfomation: "Thông số tài khoản",
		backToList: "Quay lại danh sách",
		back: "Quay lại",
		inStock: "Còn hàng",
		sold: "Đã bán",
		description: "Mô tả",
		highlights: "Đặc điểm nổi bật",
		buyNow: "Mua ngay",
		afterPaymentNote:
			"Sau khi thanh toán, acc sẽ được gửi qua email của bạn",
		loginRequired: "Yêu cầu đăng nhập",
		loginToBuy: "Vui lòng đăng nhập để mua acc game",
		orderCreated: "Tạo đơn hàng thành công",
		orderFailed: "Tạo đơn hàng thất bại, vui lòng thử lại sau",

		// Orders Page
		myOrders: "Đơn Hàng",
		ofMe: "Của Tôi",
		trackOrders: "Theo dõi trạng thái các đơn hàng của bạn",
		loginToViewOrders: "Đăng nhập để xem đơn hàng",
		loginToViewOrdersDesc:
			"Bạn cần đăng nhập để xem lịch sử đơn hàng của mình",
		loginNow: "Đăng nhập ngay",
		noOrders: "Chưa có đơn hàng nào",
		startBuying: "Bắt đầu mua acc game đầu tiên của bạn ngay!",
		viewAccGame: "Xem Acc Game",
		pay: "Thanh toán",
		statusPending: "Chờ thanh toán",
		statusPaid: "Đã thanh toán",
		statusDelivered: "Đã gửi acc",
		statusCancelled: "Đã hủy",
		statusRefunded: "Đã hoàn tiền",

		// Payment Page
		orderNotFound: "Không tìm thấy đơn hàng",
		viewMyOrders: "Xem đơn hàng của tôi",
		waitingPayment: "Chờ Thanh Toán",
		transferInfo: "Vui lòng chuyển khoản theo thông tin bên dưới",
		orderId: "Order ID",
		accGameLabel: "Acc Game",
		totalAmount: "Tổng tiền",
		scanQR: "Quét mã QR MoMo",
		orTransfer: "Hoặc chuyển khoản theo thông tin bên dưới",
		transferDetails: "Thông tin chuyển khoản",
		momoPhone: "Số điện thoại MoMo",
		accountName: "Tên tài khoản",
		transferContent: "Nội dung chuyển khoản",
		importantNote: "Lưu ý quan trọng",
		paymentNotice:
			"Sau khi chuyển khoản, vui lòng chờ admin xác nhận. Thông tin acc game sẽ được gửi qua email của bạn trong vòng 5-15 phút.",
		viewOrders: "Xem đơn hàng",
		continueShopping: "Tiếp tục mua sắm",
		copied: "Đã sao chép",
		bank: "Ngân hàng",
		accountNumber: "Số tài khoản",
		scanQRTitle: "Quét mã QR thanh toán",
		copy: "Sao chép",

		// Auth Page
		loginTitle: "Đăng Nhập",
		registerTitle: "Đăng Ký",
		loginDesc: "Đăng nhập để mua acc game",
		registerDesc: "Tạo tài khoản mới để bắt đầu",
		firstName: "Tên",
		lastName: "Họ",
		enterName: "Nhập họ tên",
		email: "Email",
		enterEmail: "Nhập email",
		password: "Mật khẩu",
		enterPassword: "Nhập mật khẩu",
		confirmPassword: "Xác nhận mật khẩu",
		forgotPassword: "Quên mật khẩu?",
		orContinueWith: "Hoặc tiếp tục với",
		processing: "Đang xử lý...",
		noAccount: "Chưa có tài khoản?",
		hasAccount: "Đã có tài khoản?",
		registerNow: "Đăng ký ngay",
		backToHome: "Về trang chủ",
		loginSuccess: "Đăng nhập thành công",
		welcomeBack: "Chào mừng bạn quay trở lại!",
		loginFailed: "Đăng nhập thất bại",
		wrongCredentials: "Email hoặc mật khẩu không đúng",
		registerSuccess: "Đăng ký thành công",
		accountCreated: "Tài khoản của bạn đã được tạo!",
		registerFailed: "Đăng ký thất bại",
		emailUsed: "Email đã được sử dụng",

		// Verify Email Page
		verifyEmailTitle: "Xác thực Email",
		verifyEmailDesc: "Chúng tôi đã gửi mã xác thực 6 số đến email:",
		enterOtpPlaceholder: "Nhập mã 6 số (VD: 123456)",
		verifying: "Đang kiểm tra...",
		verifySuccess: "Xác thực thành công",
		verifySuccessDesc: "Tài khoản đã được kích hoạt. Vui lòng đăng nhập.",
		verifyFailed: "Xác thực thất bại",
		verifyFailedDesc: "Mã OTP không chính xác",
		backToRegister: "Quay lại đăng ký",
		confirm: "Xác nhận",

		// Profile Page
		myProfile: "Hồ Sơ Của Tôi",
		manageProfile: "Quản lý thông tin cá nhân và bảo mật",
		phone: "Số điện thoại",
		saveInfo: "Lưu thông tin",
		changePassword: "Đổi mật khẩu",
		oldPassword: "Mật khẩu cũ",
		newPassword: "Mật khẩu mới",
		confirmNewPassword: "Xác nhận mật khẩu mới",
		cancel: "Hủy",
		updateSuccess: "Cập nhật thành công",
		updateSuccessDesc: "Thông tin cá nhân đã được lưu.",
		updateError: "Lỗi cập nhật",
		invalidPhone: "Số điện thoại không hợp lệ.",
		invalidName: "Họ tên không được để trống.",
		passwordLengthError: "Mật khẩu mới phải từ 8-30 ký tự.",
		passwordMatchError: "Mật khẩu xác nhận không khớp.",
		changePasswordSuccess: "Đổi mật khẩu thành công.",
		changePasswordFailed: "Đổi mật khẩu thất bại",
		oldPasswordIncorrect: "Mật khẩu cũ không chính xác.",
		newPasswordSameAsOld: "Mật khẩu mới không được trùng với mật khẩu cũ.",
		newPasswordTooShort: "Mật khẩu mới quá ngắn (tối thiểu 8 ký tự).",
		genericError: "Có lỗi xảy ra, vui lòng thử lại.",
		saving: "Đang lưu...", // Đã thêm lại key này

		// Forgot Password Page
		forgotPasswordTitle: "Quên Mật Khẩu",
		forgotPasswordStep1: "Nhập email để nhận mã khôi phục",
		forgotPasswordStep2: "Nhập mã OTP đã gửi tới",
		yourEmail: "Email của bạn",
		sendOtp: "Gửi mã xác thực",
		sending: "Đang gửi...",
		resetPassword: "Đổi mật khẩu",
		resendOrChangeEmail: "Gửi lại mã / Đổi email",
		notVerified: "Chưa xác thực",
		captchaError: "Vui lòng xác thực bạn không phải robot.",
		otpSent: "Đã gửi mã xác thực",
		otpSentDesc: "Vui lòng kiểm tra email của bạn",
		emailNotFound: "Không tìm thấy email này",
		resetPasswordSuccess: "Mật khẩu đã được đổi. Vui lòng đăng nhập lại.",
		otpIncorrect: "Mã xác thực không đúng",
		backToLogin: "Quay lại đăng nhập",
		otpPlaceholder: "Mã OTP",

		// Guide Page
		guideHeader: "Hướng dẫn chi tiết",
		guideTitle: "📖 Hướng Dẫn Mua Tài Khoản",
		guideDesc:
			"Chỉ với 4 bước đơn giản, bạn có thể sở hữu acc Play Together ưng ý. Theo dõi hướng dẫn bên dưới để mua hàng dễ dàng!",
		step: "Bước",
		step1Title: "Tìm kiếm acc phù hợp",
		step1Desc:
			"Truy cập trang Danh sách acc, sử dụng bộ lọc theo giá, game để tìm acc ưng ý.",
		step1Tips: [],
		step2Title: "Xem chi tiết acc",
		step2Desc:
			"Click vào acc để xem thông tin chi tiết, bao gồm hình ảnh, mô tả và các thuộc tính.",
		step2Tips: [],
		step3Title: "Đặt hàng & Thanh toán",
		step3Desc:
			"Vì trang web đang trong quá trình phát triển, vui lòng liên hệ qua zalo hoặc telegram để được hỗ trợ mua acc.",
		step3Tips: [],
		step4Title: "Nhận acc & Kiểm tra",
		step4Desc:
			"Sau khi thanh toán thành công, bạn sẽ nhận được thông tin đăng nhập acc.",
		step4Tips: [
			"Đăng nhập và kiểm tra acc ngay",
			"Đổi mật khẩu để bảo mật",
			"Liên hệ hỗ trợ nếu có vấn đề",
		],
		tips: "💡 Lưu ý:",
		paymentMethods: "💳 Phương Thức Thanh Toán",
		bankTransfer: "Chuyển khoản ngân hàng",
		bankTransferDesc: "Hỗ trợ tất cả ngân hàng nội địa",
		momo: "Ví MoMo",
		momoDesc: "Thanh toán nhanh qua ví điện tử",
		zalopay: "Ví ZaloPay",
		zalopayDesc: "Tiện lợi với ZaloPay",
		phoneCard: "Thẻ cào điện thoại",
		phoneCardDesc: "Viettel, Mobifone, Vinaphone",
		needSupport: "Cần hỗ trợ?",
		supportDesc:
			"Nếu bạn gặp bất kỳ vấn đề nào trong quá trình mua hàng, đừng ngần ngại liên hệ với chúng tôi qua Zalo hoặc Telegram. Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn 24/7!",
		support247: "24/7",
		reliable: "Uy tín",

		// Warranty Page
		warrantyHeader: "Cam kết uy tín",
		warrantyTitle: "🛡️ Chính Sách Bảo Hành",
		warrantyDesc:
			"Chúng tôi cam kết mang đến trải nghiệm mua sắm an toàn và đáng tin cậy. Mọi giao dịch đều được bảo hành theo chính sách rõ ràng.",
		warranty24h: "Bảo hành 24h đầu tiên",
		warranty24hDesc:
			"Tất cả acc được bảo hành trong 24 giờ đầu sau khi giao. Nếu có vấn đề về đăng nhập hoặc acc không đúng mô tả, chúng tôi sẽ hoàn tiền hoặc đổi acc mới.",
		freeExchange: "Đổi acc miễn phí",
		freeExchangeDesc:
			"Trong thời gian bảo hành, nếu acc gặp sự cố (bị khóa, mất items do lỗi hệ thống), bạn sẽ được đổi acc khác có giá trị tương đương.",
		fastSupport: "Hỗ trợ nhanh chóng",
		fastSupportDesc:
			"Đội ngũ hỗ trợ phản hồi trong vòng 30 phút (giờ hành chính) và tối đa 2 giờ (ngoài giờ hành chính).",
		coveredCases: "Được bảo hành",
		notCoveredCases: "Không bảo hành",
		covered1: "Acc không đăng nhập được do sai thông tin",
		covered2: "Acc bị khóa ngay sau khi nhận (do lỗi từ phía shop)",
		covered3: "Thông tin acc không đúng với mô tả (items, skin, level...)",
		covered4: "Acc đã được bán cho người khác trước đó",
		notCovered1: "Acc bị khóa do người mua vi phạm chính sách game",
		notCovered2: "Người mua chia sẻ thông tin acc cho người khác",
		notCovered3: "Acc bị hack do người mua không bảo mật tốt",
		notCovered4: "Yêu cầu bảo hành sau thời gian quy định (24h)",
		notCovered5: "Người mua tự ý đổi thông tin rồi quên",
		warrantyProcess: "📋 Quy Trình Bảo Hành",
		processStep1: "Liên hệ hỗ trợ",
		processStep1Desc:
			"Gửi tin nhắn qua Facebook/Zalo kèm mã đơn hàng và mô tả vấn đề",
		processStep2: "Xác minh thông tin",
		processStep2Desc:
			"Đội ngũ sẽ kiểm tra và xác nhận vấn đề trong vòng 30 phút",
		processStep3: "Xử lý bảo hành",
		processStep3Desc:
			"Hoàn tiền hoặc đổi acc mới trong vòng 1-2 giờ sau khi xác nhận",
		importantNotice: "⚠️ Lưu ý quan trọng",
		notice1:
			"Sau khi nhận acc, vui lòng đổi mật khẩu ngay để bảo mật.",
		notice2:
			"Không chia sẻ thông tin đăng nhập cho bất kỳ ai.",
		notice3:
			"Lưu lại mã đơn hàng để tiện theo dõi và bảo hành.",
		notice4:
			"Kiểm tra acc ngay sau khi nhận để đảm bảo quyền lợi bảo hành.",
		requestWarranty: "Yêu cầu bảo hành",
		requestWarrantyDesc:
			"Liên hệ ngay với chúng tôi qua Facebook hoặc Zalo kèm mã đơn hàng để được hỗ trợ nhanh nhất. Đội ngũ luôn sẵn sàng giải quyết mọi vấn đề của bạn!",

		// Footer
		footerDesc:
			"✨ Shop bán acc Play Together uy tín. Giao dịch an toàn, hỗ trợ 24/7! 🎮",
		quickLinks: "🔗 Liên kết",
		homeLink: "🏠 Trang chủ",
		accountsLink: "🎮 Danh sách acc",
		guideLink: "📖 Hướng dẫn mua",
		warrantyLink: "🛡️ Chính sách bảo hành",
		hotCategories: "🌟 Dịch vụ",
		categoryService1: "Hỗ trợ đổi thông tin tài khoản",
		categoryService2: "Mua bán acc play together",
		contactLabel: "📞 Liên hệ",
		madeWith: "Made with",
		by: "by TienCoTruong Shop",

		// Profile Page
		profile: "Thông tin cá nhân",
		profileDesc: "Xem và chỉnh sửa thông tin cá nhân của bạn",
		memberSince: "Thành viên từ",
		role: "Vai trò",
		user: "Người dùng",
		saveChanges: "Lưu thay đổi",
		name: "Họ tên",

		// Pagination
		showingResults: "Hiển thị {start}-{end} / {totalItems} kết quả",
		perPage: "Mỗi trang:",

		// Payment Page
		paymentSuccess: "Thanh toán thành công!",

		// Deposit Page
		balance: "Số dư",
		deposit: "Nạp Tiền",
		depositDesc: "Nạp tiền vào tài khoản để mua acc game",
		depositSubtitle: "Chọn phương thức thanh toán và số tiền bạn muốn nạp",
		currentBalance: "Số dư hiện tại",
		selectPaymentMethod: "Chọn phương thức thanh toán",
		depositBankTransferDesc: "Thanh toán qua QR code ngân hàng",
		depositMomoDesc: "Thanh toán qua ví MoMo",
		phoneScratchCard: "Thẻ cào điện thoại (Viettel, Mobifone, Vinaphone)",
		phoneScratchCardDesc: "Thanh toán bằng thẻ cào điện thoại",
		comingSoon: "Sắp có",
		selectAmount: "Chọn số tiền nạp",
		orEnterAmount: "Hoặc nhập số tiền khác",
		minAmount: "Tối thiểu 10.000đ",
		minAmountError: "Số tiền tối thiểu là 10.000đ",
		depositAmount: "Số tiền nạp",
		generateQR: "Tạo mã QR",
		scanQRToPay: "Quét mã QR để thanh toán",
		amount: "Số tiền",
		transactionCode: "Mã giao dịch",
		qrNote: "Vui lòng nhập đúng nội dung chuyển khoản để được cộng tiền tự động",
		qrExpired: "Mã QR đã hết hạn",
		qrExpiredDesc: "Mã QR này đã hết hạn sau 5 phút. Vui lòng tạo mã mới.",
		generateNewQR: "Tạo mã QR mới",
		createOrderFailed: "Tạo đơn hàng không thành công.",
		depositSuccessDesc: "Nạp tiền thành công!",
		unknown: "Không tồn tại.",
		allStatuses: "Tất cả trạng thái",
		sortBy: "Sắp xếp theo",
		enterAmount: "Nhập số tiền muốn nạp",
	},
	en: {
		yes: "Yes",
		no: "No",
		success: "Success",
		error: "Error",

		// Header
		home: "🏠 Home",
		accounts: "🎮 Accounts",
		guide: "📖 Guide",
		warranty: "🛡️ Warranty",
		orders: "Orders",
		login: "Login",
		logout: "Logout",

		// Header Navigation Keys
		navHome: "Home",
		navAccounts: "Accounts",
		navGuide: "Guide",
		navWarranty: "Warranty",
		navAdmin: "Admin",

		// Home
		shopBadge: "✨ Trusted Play Together Account Shop ✨",
		heroTitle1: "TienCoTruong",
		heroTitle2: "Shop 🎮💖",
		heroDescription: "🌟 Premium Play Together accounts!",
		viewAccounts: "🎮 View Accounts",
		viewAccNow: "View Accounts",
		registerFree: "✨ Register Free",
		statTransactions: "💫 Transactions",
		statCustomers: "💕 Customers",
		statSatisfied: "😊 Satisfied",
		statSupport: "💬 Support",
		whyChooseUs: "Why choose",
		us: "us",
		whyChooseDesc:
			"We commit to bringing you the best account buying experience! 🌈",
		featureReliable: "🛡️ Top Trusted",
		featureReliableDesc:
			"Over 10,000+ successful transactions, 5-star reviews from beloved customers",
		featureHouse: "🏡 Beautiful Houses",
		featureHouseDesc:
			"Many accounts with super cute decorated houses, full luxury furniture",
		featureOutfit: "👗 Diverse Outfits",
		featureOutfitDesc:
			"Accounts with hundreds of skins, limited edition outfits and rare items",
		findByPrice: "Find Accounts by",
		price: "Price",
		findByPriceDesc: "Choose a price range that fits your budget! 🎯",

		// Price Filters
		priceUnder1m: "Under 1 Million VND",
		price1mTo5m: "1 - 5 Million VND",
		price5mTo10m: "5 - 10 Million VND",
		price10mTo20m: "10 - 20 Million VND",
		priceAbove20m: "Above 20 Million VND",
		filterPriceUnder1m: "Under 1 Million",
		filterPrice1mTo5m: "1 - 5 Million",
		filterPrice5mTo10m: "5 - 10 Million",
		filterPrice10mTo20m: "10 - 20 Million",
		filterPriceAbove20m: "Above 20 Million",

		priceDescCheap: "Budget accounts for newbies",
		priceDescGood: "Good quality accounts",
		priceDescVip: "VIP accounts with many items",
		priceDescSuperVip: "Super VIP rare accounts",
		viewAllAccounts: "View all accounts 🎮",
		readyToPlay: "Ready to play Play Together? 🎮💖",
		ctaDesc: "Buy an account today for special offers! 24/7 support ✨",
		buyAccNow: "Buy Account Now",

		// Accounts Page
		accountsList: "Account",
		accGame: "List",
		accountsDesc: "Search and buy quality game accounts at the best prices",
		found: "Found",
		accGameCount: "accounts",
		noAccountsFound: "No accounts found",
		tryChangeFilter: "Try changing filters or search keywords",

		// Account Card
		details: "Details",

		// Account Filter
		searchPlaceholder: "Search game accounts by id, title...",
		allGames: "All Games",
		allPrices: "All Prices",
		clearFilters: "Clear Filters",

		// Account Detail
		accountNotFound: "Account not found",
		accountInfomation: "Account Information",
		backToList: "Back to list",
		back: "Back",
		inStock: "In Stock",
		sold: "Sold",
		description: "Description",
		highlights: "Key Features",
		buyNow: "Buy Now",
		afterPaymentNote:
			"After payment, the account will be sent to your email",
		loginRequired: "Login Required",
		loginToBuy: "Please login to buy game accounts",
		orderCreated: "Order created successfully",
		orderFailed: "Order creation failed, please try again later",

		// Orders Page
		myOrders: "My orders",
		ofMe: "Orders",
		trackOrders: "Track the status of your orders",
		loginToViewOrders: "Login to view orders",
		loginToViewOrdersDesc: "You need to login to view your order history",
		loginNow: "Login Now",
		noOrders: "No orders yet",
		startBuying: "Start buying your first game account now!",
		viewAccGame: "View Accounts",
		pay: "Pay",
		statusPending: "Pending Payment",
		statusPaid: "Paid",
		statusDelivered: "Delivered",
		statusCancelled: "Cancelled",
		statusRefunded: "Refunded",

		// Payment Page
		orderNotFound: "Order not found",
		viewMyOrders: "View my orders",
		waitingPayment: "Waiting for Payment",
		transferInfo: "Please transfer according to the information below",
		orderId: "Order ID",
		accGameLabel: "Game Account",
		totalAmount: "Total Amount",
		scanQR: "Scan MoMo QR Code",
		orTransfer: "Or transfer according to the information below",
		transferDetails: "Transfer Information",
		momoPhone: "MoMo Phone Number",
		accountName: "Account Name",
		transferContent: "Transfer Content",
		importantNote: "Important Note",
		paymentNotice:
			"After transferring, please wait for admin confirmation. Account info will be sent to your email within 5-15 minutes.",
		viewOrders: "View Orders",
		continueShopping: "Continue Shopping",
		copied: "Copied",
		bank: "Bank",
		accountNumber: "Account Number",
		scanQRTitle: "Scan QR to Pay",
		copy: "Copy",

		// Auth Page
		loginTitle: "Login",
		registerTitle: "Register",
		loginDesc: "Login to buy game accounts",
		registerDesc: "Create a new account to get started",
		registerNow: "Register now",
		firstName: "First Name",
		lastName: "Last Name",
		enterName: "Enter your name",
		email: "Email",
		enterEmail: "Enter email",
		password: "Password",
		forgotPassword: "Forgot Password?",
		enterPassword: "Enter password",
		confirmPassword: "Confirm Password",
		orContinueWith: "Or continue with",
		processing: "Processing...",
		noAccount: "Don't have an account?",
		hasAccount: "Already have an account?",
		backToHome: "Back to home",
		loginSuccess: "Login successful",
		welcomeBack: "Welcome back!",
		loginFailed: "Login failed",
		wrongCredentials: "Wrong email or password",
		registerSuccess: "Registration successful",
		accountCreated: "Your account has been created!",
		registerFailed: "Registration failed",
		emailUsed: "Email already in use",

		// Verify Email Page
		verifyEmailTitle: "Verify Email",
		verifyEmailDesc: "We have sent a 6-digit code to:",
		enterOtpPlaceholder: "Enter 6-digit code",
		verifying: "Verifying...",
		verifySuccess: "Verification Successful",
		verifySuccessDesc: "Account activated. Please login.",
		verifyFailed: "Verification Failed",
		verifyFailedDesc: "Incorrect OTP code",
		backToRegister: "Back to Register",
		confirm: "Confirm",

		// Profile Page
		myProfile: "My Profile",
		manageProfile: "Manage personal info and security",
		phone: "Phone Number",
		saveInfo: "Save Information",
		changePassword: "Change Password",
		oldPassword: "Old Password",
		newPassword: "New Password",
		confirmNewPassword: "Confirm New Password",
		cancel: "Cancel",
		updateSuccess: "Update Successful",
		updateSuccessDesc: "Personal information saved.",
		updateError: "Update Error",
		invalidPhone: "Invalid phone number.",
		invalidName: "Name cannot be empty.",
		passwordLengthError: "Password must be 8-30 characters.",
		passwordMatchError: "Passwords do not match.",
		changePasswordSuccess: "Password changed successfully.",
		changePasswordFailed: "Failed to change password",
		oldPasswordIncorrect: "Incorrect old password.",
		newPasswordSameAsOld: "New password cannot be the same as old one.",
		newPasswordTooShort: "Password too short (min 8 chars).",
		genericError: "An error occurred, please try again.",
		saving: "Saving...",

		// Forgot Password Page
		forgotPasswordTitle: "Forgot Password",
		forgotPasswordStep1: "Enter email to receive recovery code",
		forgotPasswordStep2: "Enter OTP sent to",
		yourEmail: "Your Email",
		sendOtp: "Send Code",
		sending: "Sending...",
		resetPassword: "Reset Password",
		resendOrChangeEmail: "Resend Code / Change Email",
		notVerified: "Not Verified",
		captchaError: "Please verify you are not a robot.",
		otpSent: "Code Sent",
		otpSentDesc: "Please check your email",
		emailNotFound: "Email not found",
		resetPasswordSuccess: "Password reset. Please login again.",
		otpIncorrect: "Incorrect OTP code",
		backToLogin: "Back to Login",
		otpPlaceholder: "OTP Code",

		// Guide Page
		guideHeader: "Detailed Guide",
		guideTitle: "📖 Account Buying Guide",
		guideDesc:
			"In just 4 simple steps, you can own your desired Play Together account. Follow the guide below to shop easily!",
		step: "Step",
		step1Title: "Find the right account",
		step1Desc:
			"Visit the Accounts page, use filters by price and game to find your perfect account.",
		step1Tips: [],
		step2Title: "View account details",
		step2Desc:
			"Click on an account to view detailed information, including images, description and attributes.",
		step2Tips: [],
		step3Title: "Order & Payment",
		step3Desc:
			"Since the website is currently under development, please contact us via Zalo or Telegram for support in purchasing accounts.",
		step3Tips: [],
		step4Title: "Receive & Check",
		step4Desc:
			"After successful payment, you will receive the account login information.",
		step4Tips: [
			"Login and check the account immediately",
			"Change password for security",
			"Contact support if there are issues",
		],
		tips: "💡 Note:",
		paymentMethods: "💳 Payment Methods",
		bankTransfer: "Bank Transfer",
		bankTransferDesc: "All domestic banks supported",
		momo: "MoMo Wallet",
		momoDesc: "Fast payment via e-wallet",
		zalopay: "ZaloPay Wallet",
		zalopayDesc: "Convenient with ZaloPay",
		phoneCard: "Phone Card",
		phoneCardDesc: "Viettel, Mobifone, Vinaphone",
		needSupport: "Need help?",
		supportDesc:
			"If you encounter any issues during the purchase process, do not hesitate to contact us via Zalo or Telegram. Our support team is always ready to help you 24/7!",
		support247: "24/7",
		reliable: "Trusted",

		// Warranty Page
		warrantyHeader: "Trusted Commitment",
		warrantyTitle: "🛡️ Warranty Policy",
		warrantyDesc:
			"We are committed to providing a safe and reliable shopping experience. All transactions are covered by a clear warranty policy.",
		warranty24h: "24-hour Warranty",
		warranty24hDesc:
			"All accounts are warranted for the first 24 hours after delivery. If there are login issues or the account does not match the description, we will refund or exchange for a new account.",
		freeExchange: "Free Exchange",
		freeExchangeDesc:
			"During the warranty period, if the account has issues (locked, lost items due to system error), you will get an exchange for an equivalent account.",
		fastSupport: "Fast Support",
		fastSupportDesc:
			"Support team responds within 30 minutes (business hours) and maximum 2 hours (after hours).",
		coveredCases: "Covered",
		notCoveredCases: "Not Covered",
		covered1: "Account cannot login due to wrong information",
		covered2: "Account locked right after receiving (shop error)",
		covered3:
			"Account info does not match description (items, skin, level...)",
		covered4: "Account was sold to someone else before",
		notCovered1: "Account locked due to buyer violating game policy",
		notCovered2: "Buyer shared account info with others",
		notCovered3: "Account hacked due to buyer not securing properly",
		notCovered4: "Warranty request after the specified time (24h)",
		notCovered5: "Buyer changed info themselves and forgot",
		warrantyProcess: "📋 Warranty Process",
		processStep1: "Contact Support",
		processStep1Desc:
			"Send a message via Facebook/Zalo with order ID and issue description",
		processStep2: "Verify Information",
		processStep2Desc:
			"Team will check and confirm the issue within 30 minutes",
		processStep3: "Process Warranty",
		processStep3Desc:
			"Refund or exchange new account within 1-2 hours after confirmation",
		importantNotice: "⚠️ Important Notice",
		notice1:
			"After receiving the account, please change password immediately for security.",
		notice2: "Do not share login information with anyone.",
		notice3:
			"Save your order ID for tracking and warranty.",
		notice4:
			"Check the account immediately after receiving to ensure warranty rights.",
		requestWarranty: "Request Warranty",
		requestWarrantyDesc:
			"Contact us immediately via Facebook or Zalo with your order ID for the fastest support. Our team is always ready to solve any of your problems!",

		// Footer
		footerDesc:
			"✨ Trusted Play Together account shop in Vietnam. Safe transactions, 24/7 support! 🎮",
		quickLinks: "🔗 Links",
		homeLink: "🏠 Home",
		accountsLink: "🎮 Account List",
		guideLink: "📖 Buying Guide",
		warrantyLink: "🛡️ Warranty Policy",
		hotCategories: "🌟 Hot Categories",
		categoryService1: "Support for changing account information",
		categoryService2: "Buying and selling Play Together accounts",
		contactLabel: "📞 Contact",
		madeWith: "Made with",
		by: "by TienCoTruong Shop",

		// Profile Page
		profile: "Profile",
		profileDesc: "View and edit your profile information",
		memberSince: "Member since",
		role: "Role",
		user: "User",
		saveChanges: "Save Changes",
		name: "Name",

		// Pagination
		showingResults: "Showing {start}-{end} of {totalItems} results",
		perPage: "Per page:",

		// Payment Page
		paymentSuccess: "Payment Successful!",

		// Deposit Page
		balance: "Balance",
		deposit: "Deposit",
		depositDesc: "Add funds to your account to buy game accounts",
		depositSubtitle: "Choose payment method and amount you want to deposit",
		currentBalance: "Current Balance",
		selectPaymentMethod: "Select Payment Method",
		depositBankTransferDesc: "Pay via bank QR code",
		depositMomoDesc: "Pay via MoMo wallet",
		phoneScratchCard: "Phone Scratch Card",
		phoneScratchCardDesc: "Pay with phone scratch card",
		comingSoon: "Coming Soon",
		selectAmount: "Select Amount",
		orEnterAmount: "Or enter custom amount",
		minAmount: "Minimum 10,000đ",
		minAmountError: "Minimum amount is 10,000đ",
		depositAmount: "Deposit Amount",
		generateQR: "Generate QR Code",
		scanQRToPay: "Scan QR Code to Pay",
		amount: "Amount",
		transactionCode: "Transaction Code",
		qrNote: "Please enter the correct transfer content to receive automatic credit",
		qrExpired: "QR Code Expired",
		qrExpiredDesc:
			"This QR code has expired after 5 minutes. Please generate a new one.",
		generateNewQR: "Generate New QR",
		createOrderFailed: "Fail to create order",
		depositSuccessDesc: "Deposit successful!",
		unknown: "Unknown.",
		allStatuses: "All statues",
		sortBy: "Sort by",
		enterAmount: "Enter amount to deposit",
	},
};

export const useTranslation = () => {
	const { language } = useLanguageStore();

	const t = (
		key: keyof typeof translations.vi,
		params?: Record<string, string | number>
	): string => {
		const value = translations[language][key];
		if (Array.isArray(value)) {
			return value as unknown as string;
		}
		let text = (value || key) as string;
		if (params) {
			Object.entries(params).forEach(([k, v]) => {
				text = text.replace(`{${k}}`, String(v));
			});
		}
		return text;
	};

	const tArray = (key: keyof typeof translations.vi): string[] => {
		const value = translations[language][key];
		return Array.isArray(value) ? value : [value as string];
	};

	return { t, tArray, language };
};
