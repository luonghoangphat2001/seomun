<?php

use App\Http\Controllers\Api\AddressBookController;
use App\Http\Controllers\Api\AddressSearchController;
use App\Http\Controllers\Api\Admin\AdminAccessLogController;
use App\Http\Controllers\Api\Admin\AdminAttendanceController;
use App\Http\Controllers\Api\Admin\AdminBannerController;
use App\Http\Controllers\Api\Admin\AdminBarcodeController;
use App\Http\Controllers\Api\Admin\AdminBoardNoticeConfigController;
use App\Http\Controllers\Api\Admin\AdminCashReceiptController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminCodeController;
use App\Http\Controllers\Api\Admin\AdminColorController;
use App\Http\Controllers\Api\Admin\AdminCompanySettingsController;
use App\Http\Controllers\Api\Admin\AdminTransactionSettingsController;
use App\Http\Controllers\Api\Admin\AdminCouponController;
use App\Http\Controllers\Api\Admin\AdminCustomerController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminDeliveryTrackingController;
use App\Http\Controllers\Api\Admin\AdminDirectShippingController;
use App\Http\Controllers\Api\Admin\AdminEditorSizeController;
use App\Http\Controllers\Api\Admin\AdminEditorSizeTypeController;
use App\Http\Controllers\Api\Admin\AdminEquipmentController;
use App\Http\Controllers\Api\Admin\AdminErpOptionController;
use App\Http\Controllers\Api\Admin\AdminErpOptionGroupController;
use App\Http\Controllers\Api\Admin\AdminFaqController;
use App\Http\Controllers\Api\Admin\AdminFileController;
use App\Http\Controllers\Api\Admin\AdminGuideContentController;
use App\Http\Controllers\Api\Admin\AdminInquiryController;
use App\Http\Controllers\Api\Admin\AdminInquiryStatisticsController;
use App\Http\Controllers\Api\Admin\AdminMemberController;
use App\Http\Controllers\Api\Admin\AdminMembershipController;
use App\Http\Controllers\Api\Admin\AdminMemberStatisticsController;
use App\Http\Controllers\Api\Admin\AdminNoticeController;
use App\Http\Controllers\Api\Admin\AdminNotificationHistoryController;
use App\Http\Controllers\Api\Admin\AdminNotificationTemplateController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminOrderDesignController;
use App\Http\Controllers\Api\Admin\AdminOrderDesignWorkflowController;
use App\Http\Controllers\Api\Admin\AdminOrderExtraEntryController;
use App\Http\Controllers\Api\Admin\AdminOutsourcingController;
use App\Http\Controllers\Api\Admin\AdminPaperController;
use App\Http\Controllers\Api\Admin\AdminPaperPriceController;
use App\Http\Controllers\Api\Admin\AdminPaymentController;
use App\Http\Controllers\Api\Admin\AdminPermissionController;
use App\Http\Controllers\Api\Admin\AdminPointController;
use App\Http\Controllers\Api\Admin\AdminPointSettingsController;
use App\Http\Controllers\Api\Admin\AdminPopupController;
use App\Http\Controllers\Api\Admin\AdminPostProcessingPriceController;
use App\Http\Controllers\Api\Admin\AdminPriceSimulationController;
use App\Http\Controllers\Api\Admin\AdminPricingController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminProductOptionController;
use App\Http\Controllers\Api\Admin\AdminProductOptionGroupController;
use App\Http\Controllers\Api\Admin\AdminProductStatisticsController;
use App\Http\Controllers\Api\Admin\AdminSettlementReportController;
use App\Http\Controllers\Api\Admin\AdminShipmentController;
use App\Http\Controllers\Api\Admin\AdminShippingSettingController;
use App\Http\Controllers\Api\Admin\AdminShoppingSettingController;
use App\Http\Controllers\Api\Admin\AdminShoppingSettingItemController;
use App\Http\Controllers\Api\Admin\AdminSizeOptionController;
use App\Http\Controllers\Api\Admin\AdminTaskLogController;
use App\Http\Controllers\Api\Admin\AdminTaxInvoiceController;
use App\Http\Controllers\Api\Admin\AdminTemplateController;
use App\Http\Controllers\Api\Admin\AdminUnitPriceChangeLogController;
use App\Http\Controllers\Api\Admin\AdminUnitPriceController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminUserGuideController;
use App\Http\Controllers\Api\Admin\AdminUserLimitManagementController;
use App\Http\Controllers\Api\Admin\AdminUserPermissionController;
use App\Http\Controllers\Api\Admin\AdminWebEditorController;
use App\Http\Controllers\Api\Admin\AdminWorkInstructionController;
use App\Http\Controllers\Api\Admin\ExportHistoryController;
use App\Http\Controllers\Api\Admin\MePermissionController;
use App\Http\Controllers\Api\Admin\PrintingPriceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BoardNoticeConfigController;
use App\Http\Controllers\Api\BulkOrderController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CompanyCodeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DesignController;
use App\Http\Controllers\Api\DielineController;
use App\Http\Controllers\Api\DirectShippingController;
use App\Http\Controllers\Api\EditorSizeController;
use App\Http\Controllers\Api\EditorSizeTypeController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\FilterMetadataController;
use App\Http\Controllers\Api\GuideContentController;
use App\Http\Controllers\Api\HanjinController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\HomeSectionController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\MyAccountController;
use App\Http\Controllers\Api\MyPage\ApprovalSettingsController as MyPageApprovalSettingsController;
use App\Http\Controllers\Api\MyPage\CartController as MyPageCartController;
use App\Http\Controllers\Api\MyPage\CashReceiptController as MyPageCashReceiptController;
use App\Http\Controllers\Api\MyPage\CouponController as MyPageCouponController;
use App\Http\Controllers\Api\MyPage\DepositStatusController as MyPageDepositStatusController;
use App\Http\Controllers\Api\MyPage\DesignController as MyPageDesignController;
use App\Http\Controllers\Api\MyPage\FaqController as MyPageFaqController;
use App\Http\Controllers\Api\MyPage\InquiryController as MyPageInquiryController;
use App\Http\Controllers\Api\MyPage\LimitManagementController;
use App\Http\Controllers\Api\MyPage\NoticeController as MyPageNoticeController;
use App\Http\Controllers\Api\MyPage\NotificationController as MyPageNotificationController;
use App\Http\Controllers\Api\MyPage\OrderDesignWorkflowController as MyPageOrderDesignWorkflowController;
use App\Http\Controllers\Api\MyPage\OrderHistoryController as MyPageOrderHistoryController;
use App\Http\Controllers\Api\MyPage\PaymentController as MyPagePaymentController;
use App\Http\Controllers\Api\MyPage\QuickMenuController as MyPageQuickMenuController;
use App\Http\Controllers\Api\MyPage\RecentlyViewedController as MyPageRecentlyViewedController;
use App\Http\Controllers\Api\MyPage\ReviewController as MyPageReviewController;
use App\Http\Controllers\Api\MyPage\SavedProductOptionController as MyPageSavedProductOptionController;
use App\Http\Controllers\Api\MyPage\ShippingAddressController as MyPageShippingAddressController;
use App\Http\Controllers\Api\MyPage\TaxInvoiceController as MyPageTaxInvoiceController;
use App\Http\Controllers\Api\MyPage\TransactionHistoryController as MyPageTransactionHistoryController;
use App\Http\Controllers\Api\MyPage\WorkerController as MyPageWorkerController;
use App\Http\Controllers\Api\MyPageController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrganizationChartController;
use App\Http\Controllers\Api\PaperController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentLineConfigController;
use App\Http\Controllers\Api\PointBalanceController;
use App\Http\Controllers\Api\PointTransactionController;
use App\Http\Controllers\Api\PopupController;
use App\Http\Controllers\Api\ProductConfiguratorController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductUnitPriceController;
use App\Http\Controllers\Api\ProxyLoginController;
use App\Http\Controllers\Api\PublicDesignReviewController;
use App\Http\Controllers\Api\SearchSuggestionController;
use App\Http\Controllers\Api\ShoppingSettingController;
use App\Http\Controllers\Api\SizeOptionController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\SpineCalculatorController;
use App\Http\Controllers\Api\StorePermissionController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\VirtualAccountController;
use App\Http\Controllers\Api\WebhookOrderController;
use App\Http\Controllers\Api\WithdrawalController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', [HealthController::class, 'index']);

// Bearer-token review links sent to customers by SMS after design drafts are saved.
Route::get('/design-reviews/{token}', [PublicDesignReviewController::class, 'show']);
Route::post('/design-reviews/{token}/responses', [PublicDesignReviewController::class, 'respondBatch']);
Route::post('/design-reviews/{token}/items/{orderItemId}/response', [PublicDesignReviewController::class, 'respond'])->where('orderItemId', '[0-9]+');

// Public print design download for Swagger/browser usage.
Route::get('/admin/orders/{orderNumber}/print-design', [AdminOrderController::class, 'printDesign']);

// Home Configuration routes (홈 설정)
Route::prefix('home')->group(function () {
    // 홈 섹션 목록 (Public - Active sections only)
    Route::get('/sections', [HomeSectionController::class, 'index']);

    // 홈 섹션 상세 (Public)
    Route::get('/sections/{id}', [HomeSectionController::class, 'show']);
});

// Banner routes (배너 - Public for app)
Route::prefix('banners')->group(function () {
    // Homepage banners
    Route::get('/homepage', [BannerController::class, 'homepage']);

    // Login modal banners
    Route::get('/login', [BannerController::class, 'login']);
});

// Popup routes (팝업 - Public for app)
Route::prefix('popups')->group(function () {
    // 팝업 목록 (Public - Active/Visible popups only)
    Route::get('/', [PopupController::class, 'index'])->middleware('optional.auth');
});

// Webhook Order
Route::prefix('/webhook')->group(function () {
    // No-middleware routes must be declared BEFORE the verify.webhook routes to avoid conflicts
    Route::get('/orders', [WebhookOrderController::class, 'index']);
    Route::get('/orders/ungrouped', [WebhookOrderController::class, 'ungroupedOrders']);

    Route::post('/orders', [WebhookOrderController::class, 'receiveOrders'])->middleware(['verify.webhook']);
    Route::post('/orders/approval', [WebhookOrderController::class, 'updateApprovalStatus'])->middleware(['verify.webhook']);
    Route::post('/orders/{externalOrderId}/design-files', [WebhookOrderController::class, 'updateDesignFiles']);
    Route::post('/orders/{externalOrderId}/reject', [WebhookOrderController::class, 'rejectOrder']);
    Route::get('/order-codes/{orderCode}/options', [WebhookOrderController::class, 'getOptionsByOrderCode']);
    Route::post('/order-codes/available-options', [WebhookOrderController::class, 'getAvailableOptions']);
    Route::post('/order-codes/get-price', [WebhookOrderController::class, 'getPrice']);

    // Size Options
    // Route::get('/size-options/{orderCode}', [SizeOptionController::class, 'getByOrderCode']);
});

// Filter Metadata routes (필터 메타데이터)
Route::get('/filter-metadata', [FilterMetadataController::class, 'index']);

// Search Suggestions routes (검색 제안)
Route::get('/search-suggestions', [SearchSuggestionController::class, 'index']);

// Board Notice Config routes (게시판 공지 설정)
Route::prefix('board-notice-configs')->group(function () {
    Route::get('/{boardType}', [BoardNoticeConfigController::class, 'show']);
});

// Notice routes (공지사항)
Route::prefix('notices')->group(function () {
    // 공지사항 목록 (Public - Active notices only)
    Route::get('/', [NoticeController::class, 'index']);

    // 공지사항 상세 (Public)
    Route::get('/{id}', [NoticeController::class, 'show']);
});

// FAQ routes (자주 묻는 질문)
Route::prefix('faqs')->group(function () {
    // FAQ 목록 (Public - Active FAQs only)
    Route::get('/', [FaqController::class, 'index'])->middleware('optional.auth');

    // FAQ 카테고리별 집계 (Public - tab badges)
    Route::get('/category-counts', [FaqController::class, 'categoryCounts'])->middleware('optional.auth');

    // FAQ 상세 (Public)
    Route::get('/{id}', [FaqController::class, 'show'])->middleware('optional.auth');

    // FAQ 조회수 증가 (Public)
    Route::post('/{id}/view', [FaqController::class, 'recordView']);
});

// Guide Content routes (안내 관리)
Route::prefix('guide-contents')->group(function () {
    // 안내 목록 (Public - Active guides only)
    Route::get('/', [GuideContentController::class, 'index']);

    // 안내 상세 (Public)
    Route::get('/{id}', [GuideContentController::class, 'show']);
});

// Shopping Settings routes (쇼핑 설정)
Route::prefix('shopping-settings')->group(function () {
    // 쇼핑 설정 목록 (Public)
    Route::get('/', [ShoppingSettingController::class, 'index']);

    // 쇼핑 설정 상세 (Public)
    Route::get('/{id}', [ShoppingSettingController::class, 'show']);
});

// Public product and category routes
Route::prefix('products')->group(function () {
    // 제품 목록 (Product List)
    Route::get('/', [ProductController::class, 'index']);

    // 인기 상품 (Popular Products)
    Route::get('/popular', [ProductController::class, 'popular']);

    // 제품 검색 (Product Search)
    Route::get('/search', [ProductController::class, 'search']);

    // 템플릿 목록 (Product Templates) - for user web (Simple Text / Web Editor)
    Route::get('/{slug}/templates', [TemplateController::class, 'byProduct']);

    Route::get('/{slug}/templates/search-filters', [TemplateController::class, 'searchFilters']);

    // 웹 에디터 목록 (Web Editors for this product)
    Route::get('/{slug}/web-editors', [TemplateController::class, 'webEditorsByProduct']);

    // 이용안내 (Usage Guide) – active guides for this product. Must be before /{slug}.
    Route::get('/{slug}/user-guides', [ProductController::class, 'userGuides']);

    // 리뷰 목록 (Product Reviews)
    Route::get('/{slug}/reviews', [ProductController::class, 'reviews']);

    // 칼선 다운로드 (Dieline Download - Custom Die Cut)
    Route::prefix('/{slug}')->group(function () {
        Route::prefix('dieline')->group(function () {
            Route::post('preview', [DielineController::class, 'preview']);
            Route::post('download', [DielineController::class, 'download']);
        });

        Route::get('standard-dielines', [DielineController::class, 'standardDielines']);
    });

    // 제품 상세 (Product Detail)
    Route::get('/{slug}', [ProductController::class, 'show']);

    // Public spine calculator
    Route::post('/spine-calculator', [SpineCalculatorController::class, 'calculate']);

    // Product Configurator Initialize (제품 설정 초기화)
    Route::post('/{id}/configurator/initialize', [ProductConfiguratorController::class, 'initialize']);

    // Product Configurator Quote — returns unit-price-based breakdown
    Route::post('/{id}/quote', [ProductConfiguratorController::class, 'quote'])->where('id', '[0-9]+');

    // Get quantity tiers (settlement items) for the matched PRINTING UnitPrice
    Route::get('/{id}/quality', [ProductConfiguratorController::class, 'getquantity'])->where('id', '[0-9]+');

    // Get unit prices by product slug
    Route::get('/{slug}/unit-prices', [ProductUnitPriceController::class, 'index']);

    // Product Configurator Resolve (제품 설정Resolver)
    Route::post('/{id}/configurator/resolve', [ProductConfiguratorController::class, 'resolve']);

    // Get Size Papers by Product ID
    Route::get('/{productId}/papers', [PaperController::class, 'getPapersByProductId'])->where('productId', '[0-9]+');

    // Get Size Options by Product ID
    Route::get('/{productId}/size-options', [SizeOptionController::class, 'getByProductId'])->where('productId', '[0-9]+');
});

// Public template routes (for user web)
Route::prefix('templates')->group(function () {
    // 템플릿 상세 (Template Detail for user web)
    Route::get('/{id}', [TemplateController::class, 'show'])->where('id', '[0-9]+');
});

// Public editor size types and sizes routes
Route::prefix('editor-size-types')->group(function () {
    Route::get('/', [EditorSizeTypeController::class, 'index']);
});

Route::prefix('editor-sizes')->group(function () {
    Route::get('/', [EditorSizeController::class, 'index']);
});

Route::prefix('categories')->group(function () {
    // 카테고리 목록 (Category List)
    Route::get('/', [CategoryController::class, 'index']);

    // 카테고리 상세 (Category Detail)
    Route::get('/{slug}', [CategoryController::class, 'show']);

    // 카테고리별 제품 (Products by Category)
    Route::get('/{slug}/products', [CategoryController::class, 'products']);
});

// Company Code verification (고객사 정보 확인)
Route::prefix('company-codes')->group(function () {
    // 고객사 인증코드 확인 (Verify Company Code)
    Route::post('/verify', [CompanyCodeController::class, 'verify']);
});

// Public Papers
Route::prefix('papers')->group(function () {
    Route::get('/', [PaperController::class, 'index']);
});

// Public authentication routes
Route::prefix('auth')->group(function () {
    // 회원가입 (Register)
    Route::post('/register', [AuthController::class, 'register']);

    // 로그인 (Login)
    Route::post('/login', [AuthController::class, 'login']);

    // 토큰 갱신 (Refresh Token)
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // 인증번호 전송 (Send Verification Code)
    Route::post('/send-verification-code', [AuthController::class, 'sendVerificationCode']);

    // 인증번호 확인 (Verify Verification Code)
    Route::post('/verify-verification-code', [AuthController::class, 'verifyVerificationCode']);

    // 아이디 찾기 (Find Username/ID)
    Route::post('/find-username', [AuthController::class, 'findUsername']);

    // 비밀번호 찾기 (Forgot Password - Send reset link)
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

    // 비밀번호 재설정 (Reset Password)
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // 회원가입 화면용 조직 코드 옵션 (Organization options for registration)
    Route::get('/organization-options', [AuthController::class, 'organizationOptions']);

    // 인증번호로 비밀번호 재설정 (Reset Password with verification code)
    Route::post('/reset-password/with-code', [AuthController::class, 'resetPasswordWithCode']);

    // SNS 소셜 로그인 (Social Login - Kakao, Naver)
    Route::get('/social/{provider}/redirect-url', [SocialAuthController::class, 'redirectUrl']);
    Route::post('/social/{provider}/callback', [SocialAuthController::class, 'callback']);
    // For testing only — provider redirects directly to BE
    Route::get('/social/{provider}/callback-direct', [SocialAuthController::class, 'callbackDirect']);
});

// Payment webhook (결제 웹훅 - no auth required, called by payment gateway)
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);
Route::post('/payments/webhook/deposit-callback', [PaymentController::class, 'depositCallback']);

// User FE consumes a one-time HttpOnly handoff cookie from the admin proxy-login flow.
Route::post('/proxy-login/exchange', [ProxyLoginController::class, 'exchange']);

// Serve images from resources/images folder
// Route::get('/images/{path}', function (Request $request, string $path) {
//     $fullPath = resource_path('images/'.$path);

//     // Security check: prevent directory traversal
//     $realPath = realpath($fullPath);
//     $realBase = realpath(resource_path('images'));

//     if (! $realPath || ! $realBase || strpos($realPath, $realBase) !== 0) {
//         abort(403, 'Access denied');
//     }

//     if (! file_exists($realPath)) {
//         abort(404, 'Image not found');
//     }

//     $mimeType = mime_content_type($realPath);

//     return response()->file($realPath, [
//         'Content-Type' => $mimeType,
//         'Cache-Control' => 'public, max-age=31536000',
//     ]);
// })->where('path', '.*');

// Protected routes (require authentication)
Route::middleware(['auth:sanctum', 'user.active'])->group(function () {
    // 로그아웃 (Logout)
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // 현재 사용자 정보 (Get current user)
    Route::get('/auth/me', [AuthController::class, 'me']);

    // 비밀번호 변경 (Change Password)
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // 핸드폰 번호 변경 - 인증번호 전송 (Send Verification Code for Change Phone)
    Route::post('/auth/change-phone/send-code', [AuthController::class, 'sendChangePhoneVerificationCode']);

    // 핸드폰 번호 변경 (Change Phone)
    Route::put('/auth/change-phone', [AuthController::class, 'changePhone']);

    // Legacy route for backward compatibility
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard routes (대시보드)
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);

    // MyPage routes (마이페이지)
    Route::prefix('mypage')->group(function () {
        // 대시보드 (Dashboard)
        Route::get('/dashboard', [MyPageController::class, 'dashboard']);

        // Designs (디자인 관리)
        Route::prefix('designs')->group(function () {
            Route::get('/', [MyPageDesignController::class, 'index']);
            Route::get('/available_sizes', [MyPageDesignController::class, 'getAvailableSizes']);
        });

        // 프로필 조회 (Get Profile)
        Route::get('/profile', [MyPageController::class, 'show']);

        // 프로필 수정 (Update Profile)
        Route::put('/profile', [MyPageController::class, 'update']);

        // switch to business member
        Route::post('/convert-to-business-member', [MyPageController::class, 'convertToBusinessMember']);

        // 비밀번호 변경 (Change Password)
        Route::put('/profile/password', [MyPageController::class, 'updatePassword']);

        // 사업자등록증 업로드 (Upload Business Registration File)
        Route::post('/profile/business-registration-file', [MyPageController::class, 'uploadBusinessRegistrationFile']);

        // FAQ (자주 묻는 질문)
        Route::get('/faqs/category-counts', [MyPageFaqController::class, 'categoryCounts']);
        Route::get('/faqs', [MyPageFaqController::class, 'index']);
        Route::get('/faqs/{id}', [MyPageFaqController::class, 'show']);

        // Notice (공지사항)
        Route::get('/category_notices', [MyPageNoticeController::class, 'categoryNotices']);
        Route::get('/notices', [MyPageNoticeController::class, 'index']);
        Route::get('/notices/{id}', [MyPageNoticeController::class, 'show']);

        // Notifications (실시간 알림함)
        Route::get('/notifications', [MyPageNotificationController::class, 'index']);
        Route::patch('/notifications/read-all', [MyPageNotificationController::class, 'markAllAsRead']);
        Route::patch('/notifications/{notificationId}/read', [MyPageNotificationController::class, 'markAsRead']);

        // 저장한 옵션 (저장 옵션 불러오기)
        Route::prefix('saved-options')->group(function () {
            Route::get('/', [MyPageSavedProductOptionController::class, 'index']);
            Route::post('/', [MyPageSavedProductOptionController::class, 'store']);
            Route::post('/add-to-cart', [MyPageSavedProductOptionController::class, 'addToCart']);
            Route::delete('/{id}', [MyPageSavedProductOptionController::class, 'destroy'])->whereNumber('id');
        });

        // Shopping Cart (장바구니)
        Route::get('/cart', [MyPageCartController::class, 'index']);
        Route::post('/cart', [MyPageCartController::class, 'store']);
        Route::post('/cart/selection-summary', [MyPageCartController::class, 'selectionSummary']);
        // Batch delete must be defined before /cart/{itemId} to avoid treating "batch" as {itemId}
        Route::delete('/cart/batch', [MyPageCartController::class, 'batchDestroy']);
        Route::put('/cart/{itemId}', [MyPageCartController::class, 'update']);
        Route::delete('/cart/{itemId}', [MyPageCartController::class, 'destroy']);
        Route::post('/cart/{itemId}/extend-storage', [MyPageCartController::class, 'extendStorage']);
        Route::post('/cart/checkout', [MyPageCartController::class, 'checkout']);
        Route::post('/cart/checkout/quote', [MyPageCartController::class, 'checkoutQuote']);

        // 1:1 Inquiry (1:1 문의)
        Route::get('/inquiries', [MyPageInquiryController::class, 'index']);
        Route::get('/inquiries/{id}', [MyPageInquiryController::class, 'show']);
        Route::post('/inquiries', [MyPageInquiryController::class, 'store']);
        Route::post('/inquiries/{id}/comments', [MyPageInquiryController::class, 'addComment']);

        // Shipping Addresses (배송지 관리)
        Route::get('/shipping-addresses', [MyPageShippingAddressController::class, 'index']);
        Route::get('/shipping-addresses/{id}', [MyPageShippingAddressController::class, 'show']);
        Route::post('/shipping-addresses', [MyPageShippingAddressController::class, 'store']);
        Route::put('/shipping-addresses/{id}', [MyPageShippingAddressController::class, 'update']);
        Route::delete('/shipping-addresses', [MyPageShippingAddressController::class, 'destroy']);
        Route::post('/shipping-addresses/{id}/set-default', [MyPageShippingAddressController::class, 'setDefault']);

        // Quick Menu Settings (퀵 메뉴 설정)
        Route::get('/quick-menu', [MyPageQuickMenuController::class, 'index']);
        Route::get('/quick-menu/options', [MyPageQuickMenuController::class, 'options']);
        Route::put('/quick-menu', [MyPageQuickMenuController::class, 'update']);

        // Recently Viewed Products (최근 본 상품)
        Route::get('/recently-viewed', [MyPageRecentlyViewedController::class, 'index']);
        Route::post('/recently-viewed/{productId}', [MyPageRecentlyViewedController::class, 'track']);
        Route::delete('/recently-viewed/{productId}', [MyPageRecentlyViewedController::class, 'destroy']);
        Route::delete('/recently-viewed', [MyPageRecentlyViewedController::class, 'clearAll']);

        // Coupons & Benefits (쿠폰/혜택)
        Route::get('/coupons', [MyPageCouponController::class, 'index']);
        Route::get('/coupons/available', [MyPageCouponController::class, 'available']);
        Route::post('/coupons/{couponId}/claim', [MyPageCouponController::class, 'claim']);
        Route::get('/benefits', [MyPageCouponController::class, 'benefits']);

        // Reviews/Ratings (리뷰/별점)
        Route::get('/reviews', [MyPageReviewController::class, 'index']);
        Route::post('/reviews', [MyPageReviewController::class, 'store']);
        Route::get('/reviews/unreviewed', [MyPageReviewController::class, 'unreviewedOrderItems']);
        Route::put('/reviews/{reviewId}', [MyPageReviewController::class, 'update']);
        Route::delete('/reviews/{reviewId}', [MyPageReviewController::class, 'destroy']);

        // Approval/Authorization Settings (결재/승인 설정)
        Route::get('/approval-settings', [MyPageApprovalSettingsController::class, 'index']);
        Route::put('/approval-settings', [MyPageApprovalSettingsController::class, 'update']);
        Route::get('/approval-settings/options', [MyPageApprovalSettingsController::class, 'options']);

        // Limit history and usaged
        Route::get('/limit', [LimitManagementController::class, 'index']);
        Route::get('/limit/history', [LimitManagementController::class, 'history']);

        // Payment history
        Route::get('/payments', [MyPagePaymentController::class, 'index']);
        Route::get('/payments/pending', [MyPagePaymentController::class, 'pending']);
        Route::get('/payments/completed', [MyPagePaymentController::class, 'completed']);
        Route::get('/payments/failed', [MyPagePaymentController::class, 'failed']);
        Route::get('/payments/{transactionId}', [MyPagePaymentController::class, 'show']);
        Route::post('/payments/bulk-approve', [MyPagePaymentController::class, 'bulkApprove']);
        Route::post('/payments/bulk-reject', [MyPagePaymentController::class, 'bulkReject']);

        Route::prefix('virtual-accounts')->group(function () {
            Route::get('/', [VirtualAccountController::class, 'index']);
            Route::post('/', [VirtualAccountController::class, 'store']);
            Route::put('/', [VirtualAccountController::class, 'update']);
        });

        Route::get('/export-excel/{historyId}/check-progress-status', [MyPageCashReceiptController::class, 'checkProgressStatus'])->where('historyId', '[0-9]+');
        Route::get('/export-excel/{historyId}/download', [MyPageCashReceiptController::class, 'download'])->where('historyId', '[0-9]+');
    });

    // 주문배송조회 (Order & Delivery Tracking)
    Route::prefix('mypage-order-delivery-tracking')->group(function () {
        Route::get('/histories', [MyPageOrderHistoryController::class, 'index']);
        // Export to Excel (must be before /histories/{orderNumber})
        Route::post('/histories/export-excel', [MyPageOrderHistoryController::class, 'exportExcel']);
        Route::get('/histories/export-excel/{historyId}/check-progress-status', [MyPageOrderHistoryController::class, 'checkProgressStatus'])->where('historyId', '[0-9]+');
        Route::get('/histories/export-excel/{historyId}/download', [MyPageOrderHistoryController::class, 'download'])->where('historyId', '[0-9]+');
        Route::get('/histories/{orderNumber}/shipping-addresses', [MyPageOrderHistoryController::class, 'shippingAddressPicker']);
        Route::get('/histories/{orderNumber}/shipping-address-changes', [MyPageOrderHistoryController::class, 'shippingAddressChangeHistory']);
        Route::post('/histories/{orderNumber}/proof/revision-request', [MyPageOrderHistoryController::class, 'requestProofRevision']);
        Route::post('/histories/{orderNumber}/proof/resubmit-file', [MyPageOrderHistoryController::class, 'resubmitProofFile']);
        Route::post('/histories/{orderNumber}/proof/confirm', [MyPageOrderHistoryController::class, 'confirmProof']);
        Route::get('/histories/{orderNumber}/design-workflow', [MyPageOrderDesignWorkflowController::class, 'show']);
        Route::post('/histories/{orderNumber}/design-workflow/items/{orderItemId}/response', [MyPageOrderDesignWorkflowController::class, 'respond'])->where('orderItemId', '[0-9]+');
        Route::put('/histories/{orderNumber}/shipping-address', [MyPageOrderHistoryController::class, 'updateShippingAddress']);
        Route::get('/histories/{orderNumber}/quotation/pdf', [MyPageOrderHistoryController::class, 'downloadQuotationPdf']);
        Route::get('/histories/{orderNumber}/transaction-statement/pdf', [MyPageOrderHistoryController::class, 'downloadTransactionStatementPdf']);
        Route::get('/histories/{orderNumber}', [MyPageOrderHistoryController::class, 'show']);
    });

    // Payment methods list (for order form)
    Route::get('/payment-methods', [PaymentController::class, 'methods']);

    // Create Orders
    Route::prefix('orders')->group(function () {
        Route::post('/quote', [OrderController::class, 'quote']);
        Route::post('/validate', [OrderController::class, 'validate']);
        Route::get('/checkout/applicable-coupons', [OrderController::class, 'applicableCoupons']);
        Route::post('/', [OrderController::class, 'store']);
    });

    // Get Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::put('/orders/{orderNumber}/shipping-info', [OrderController::class, 'updateShippingInfo']);
    Route::post('/orders/{orderNumber}/attach-designs', [OrderController::class, 'attachDesigns']);
    Route::post('/orders/{orderNumber}/reorder', [OrderController::class, 'createReOrder']);
    Route::patch('/orders/{orderNumber}/apply-point', [OrderController::class, 'applyPoint']);

    // Bulk order Excel template by product (단체 주문 엑셀 템플릿)
    Route::get('products/{id}/bulk-order-template', [BulkOrderController::class, 'downloadTemplate'])->whereNumber('id');

    // Bulk Order routes (대량 주문 - requires authentication)
    Route::prefix('bulk-orders')->group(function () {
        Route::get('/', [BulkOrderController::class, 'index']);
        Route::post('/', [BulkOrderController::class, 'store']);
        Route::get('/{id}', [BulkOrderController::class, 'show']);
        Route::post('/{id}/upload', [BulkOrderController::class, 'uploadExcel']);
        Route::post('/{id}/validate', [BulkOrderController::class, 'validate']);
        Route::post('/{id}/add-to-cart', [BulkOrderController::class, 'addToCart']);
        Route::post('/{id}/cancel', [BulkOrderController::class, 'cancel']);
    });

    // Payment routes (결제)
    Route::prefix('payments')->group(function () {
        // Initiate payment (결제 시작)
        Route::post('/', [PaymentController::class, 'initiate']);

        // Virtual account payment (결제 시작)
        Route::post('/virtual-account/pay', [PaymentController::class, 'payByVirtualAccount']);

        // Toss confirm (토스 결제 승인)
        Route::post('/toss/confirm', [PaymentController::class, 'confirmToss']);

        // Verify payment (결제 확인)
        Route::post('/{transactionId}/verify', [PaymentController::class, 'verify']);

        // Get payment transaction details (결제 내역 조회)
        Route::get('/{transactionId}', [PaymentController::class, 'show']);

        // Cancel payment (결제 취소)
        Route::post('/{transactionId}/cancel', [PaymentController::class, 'cancel']);

        // Request refund (환불 요청)
        Route::post('/{transactionId}/refund', [PaymentController::class, 'refund']);
    });

    // Address search (주소/우편번호 검색 - stub, integrate postal API later)
    Route::post('/address/search', [AddressSearchController::class, 'search']);

    // Point routes (포인트) - Response: PointTransactionResource
    Route::prefix('points')->group(function () {
        // 포인트 잔액 조회 (Get Point Balance)
        Route::get('/balance', [PointBalanceController::class, 'index']);

        // 포인트 내역 조회 (Get Point Transactions) - Response: PointTransactionResource
        Route::get('/transactions', [PointTransactionController::class, 'index']);

        // 포인트 요약 조회 (Get Point Summary)
        Route::get('/transactions/summary', [PointTransactionController::class, 'summary']);
    });

    // Membership routes (멤버십) - Response: MembershipResource
    Route::prefix('memberships')->group(function () {
        // 내 멤버십 정보 (Get My Membership) - Response: MembershipSummaryResource
        Route::get('/me', [MembershipController::class, 'me']);

        // 모든 멤버십 등급 목록 (Get All Membership Tiers) - Response: MembershipResource
        Route::get('/', [MembershipController::class, 'index']);
    });

    // Address Book routes (배송지 관리)
    Route::prefix('address-books')->group(function () {
        // 배송지 목록 (Address Book List)
        Route::get('/', [AddressBookController::class, 'index']);

        // 배송지 등록 (Create Address Book)
        Route::post('/', [AddressBookController::class, 'store']);

        // 배송지 일괄 삭제 (Batch Delete Address Books)
        Route::delete('/batch', [AddressBookController::class, 'batchDestroy']);

        // 배송지 상세 (Get Address Book Detail)
        Route::get('/{id}', [AddressBookController::class, 'show']);

        // 배송지 수정 (Update Address Book)
        Route::put('/{id}', [AddressBookController::class, 'update']);

        // 배송지 삭제 (Delete Address Book)
        Route::delete('/{id}', [AddressBookController::class, 'destroy']);

        // 기본 배송지 설정 (Set Default Address)
        Route::post('/{id}/set-default', [AddressBookController::class, 'setDefault']);
    });

    // Direct Shipping routes (직배송 신청)
    Route::prefix('customer-service/direct-shipping')->group(function () {
        Route::get('/search-filters', [DirectShippingController::class, 'searchFilters']);
        Route::get('/', [DirectShippingController::class, 'index']); // search, search_by
        Route::post('/', [DirectShippingController::class, 'store']);
        Route::get('/{id}', [DirectShippingController::class, 'show']);
    });

    // Deposit Status routes (입금현황)
    Route::prefix('mypage/deposit-status')->group(function () {
        Route::get('/', [MyPageDepositStatusController::class, 'index']);
        Route::post('/export-excel', [MyPageDepositStatusController::class, 'exportExcel']);
    });

    // Transaction History routes (거래내역조회)
    Route::get('mypage/transaction-history', [MyPageTransactionHistoryController::class, 'index']);

    // Cash Receipt routes (현금영수증 - individual members)

    Route::prefix('mypage/cash-receipts')->group(function () {
        Route::get('/', [MyPageCashReceiptController::class, 'index']);
        Route::post('/export-excel', [MyPageCashReceiptController::class, 'exportExcel']);
    });

    // Tax Invoice routes (세금계산서 - corporate members)
    Route::prefix('mypage/tax-invoices')->group(function () {
        Route::get('/', [MyPageTaxInvoiceController::class, 'index']);
        Route::post('/export-excel', [MyPageTaxInvoiceController::class, 'exportExcel']);
    });

    // Worker Management routes (작업자관리)
    Route::prefix('mypage/workers')->group(function () {
        Route::get('/', [MyPageWorkerController::class, 'index']);
        Route::post('/', [MyPageWorkerController::class, 'store']);
        Route::delete('/batch', [MyPageWorkerController::class, 'batchDestroy']);
        Route::get('/{id}', [MyPageWorkerController::class, 'show']);
        Route::put('/{id}', [MyPageWorkerController::class, 'update']);
        Route::delete('/{id}', [MyPageWorkerController::class, 'destroy']);
    });

    // Withdrawal routes (회원탈퇴)
    Route::prefix('mypage/withdrawal')->group(function () {
        Route::get('/check', [WithdrawalController::class, 'check']);
        Route::post('/', [WithdrawalController::class, 'withdraw']);
    });

    // My Account routes (전용계좌 / 환불계좌 관리)
    Route::prefix('mypage/account')->group(function () {
        // 계좌 조회 (Get Account Info)
        Route::get('/', [MyAccountController::class, 'show']);

        // 전용계좌 은행 변경 (Change Bank)
        Route::post('/bank', [MyAccountController::class, 'updateBank']);
        Route::put('/bank', [MyAccountController::class, 'updateBank']);

        // 환불내역 조회 (Get Refund Histories)
        Route::get('/histories', [MyAccountController::class, 'histories']);

        // 전용계좌 발급확인서 (Certificate)
        Route::get('/certificate', [MyAccountController::class, 'certificate']);
    });

    Route::prefix('files')->group(function () {
        Route::post('/', [FileController::class, 'upload']);
    });

    // Design/Artwork routes (디자인/아트워크 관리)
    Route::prefix('designs')->group(function () {
        // Create upload-file design (디자인 생성 - upload file 전용)
        Route::post('/store-upload-file', [DesignController::class, 'storeUploadFile']);

        // Create design (디자인 생성)
        Route::post('/', [DesignController::class, 'store']);

        // Get design details (디자인 상세 조회)
        Route::get('/{id}', [DesignController::class, 'show']);

        // Update design (디자인 수정)
        Route::put('/{id}', [DesignController::class, 'update']);

        // Delete design (디자인 삭제)
        Route::delete('/{id}', [DesignController::class, 'destroy']);

        // Create individual OrderArtwork under existing DesignGroup
        Route::post('/{id}/orderartworks', [DesignController::class, 'storeOrderArtwork']);

        // Update individual OrderArtwork (개별 아트워크 수정)
        Route::put('/orderartworks/{orderArtworkId}', [DesignController::class, 'updateOrderArtwork']);

        // Delete individual OrderArtwork (개별 아트워크 삭제)
        Route::delete('/orderartworks/{orderArtworkId}', [DesignController::class, 'destroyOrderArtwork']);

        // Upload logo (로고 업로드)
        Route::post('/orderartworks/{orderArtworkId}/upload-logo', [DesignController::class, 'uploadLogo']);

        // Upload preview image (프리뷰 이미지 업로드)
        Route::post('/orderartworks/{orderArtworkId}/preview-image', [DesignController::class, 'uploadPreviewImage']);

        // Get preview image (프리뷰 이미지 조회)
        Route::get('/orderartworks/{orderArtworkId}/preview-image', [DesignController::class, 'getPreviewImage']);

        // Save layout data (레이아웃 데이터 저장)
        Route::post('/orderartworks/{orderArtworkId}/save-layout', [DesignController::class, 'saveLayout']);

        // Generate preview (미리보기 이미지 생성)
        Route::post('/orderartworks/{orderArtworkId}/generate-preview', [DesignController::class, 'generatePreview']);
    });

    // Home Section Admin routes (홈 섹션 관리 - Admin only)
    Route::prefix('home')->group(function () {
        // 홈 섹션 목록 (Admin - All sections including inactive)
        Route::get('/admin/sections', [HomeSectionController::class, 'adminIndex']);

        // 홈 섹션 생성 (Create Home Section)
        Route::post('/sections', [HomeSectionController::class, 'store']);

        // 홈 섹션 수정 (Update Home Section)
        Route::put('/sections/{id}', [HomeSectionController::class, 'update']);

        // 홈 섹션 삭제 (Delete Home Section)
        Route::delete('/sections/{id}', [HomeSectionController::class, 'destroy']);
    });

    // Notice Admin routes (공지사항 관리 - Admin only)
    Route::prefix('notices')->group(function () {
        // 공지사항 목록 (Admin - All notices including inactive)
        Route::get('/admin/list', [NoticeController::class, 'adminIndex']);

        // 공지사항 생성 (Create Notice)
        Route::post('/', [NoticeController::class, 'store']);

        // 공지사항 수정 (Update Notice)
        Route::put('/{id}', [NoticeController::class, 'update']);

        // 공지사항 삭제 (Delete Notice)
        Route::delete('/{id}', [NoticeController::class, 'destroy']);
    });

    // FAQ Admin routes (FAQ 관리 - Admin only)
    Route::prefix('faqs')->group(function () {
        // FAQ 목록 (Admin - All FAQs including inactive)
        Route::get('/admin/list', [FaqController::class, 'adminIndex']);

        // FAQ 생성 (Create FAQ)
        Route::post('/', [FaqController::class, 'store']);

        // FAQ 수정 (Update FAQ)
        Route::put('/{id}', [FaqController::class, 'update']);

        // FAQ 삭제 (Delete FAQ)
        Route::delete('/{id}', [FaqController::class, 'destroy']);
    });

    Route::prefix('hanjin')->group(function () {
        Route::get('/tracking', [HanjinController::class, 'tracking']);
    });

    Route::prefix('store-admin')->middleware(['user.store.admin'])->group(function () {
        Route::prefix('permissions')->group(function () {
            Route::get('/', [StorePermissionController::class, 'index']);
            Route::get('/{id}', [StorePermissionController::class, 'show']);
            Route::post('/', [StorePermissionController::class, 'store']);
            Route::put('/{id}', [StorePermissionController::class, 'update']);
            Route::delete('/{id}', [StorePermissionController::class, 'destroy']);
        });

        Route::prefix('payment-line-config')->group(function () {
            Route::post('/', [PaymentLineConfigController::class, 'upsert']);
            Route::get('/', [PaymentLineConfigController::class, 'index']);
        });

        Route::prefix('organization-chart')->group(function () {
            Route::get('/', [OrganizationChartController::class, 'index']);
            // Flat list; same customer_id scope as GET .../organization-chart (for dropdowns)
            Route::get('/options', [OrganizationChartController::class, 'flatOptions']);
            Route::post('/batch', [OrganizationChartController::class, 'storeBatch']);
            Route::post('/', [OrganizationChartController::class, 'store']);
            Route::put('/{id}', [OrganizationChartController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [OrganizationChartController::class, 'destroy'])->where('id', '[0-9]+');
        });
    });

    // Admin routes (관리자 전용)
    Route::prefix('admin')->middleware(['user.admin'])->group(function () {
        Route::prefix('bank-deposits')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\AdminBankDepositController::class, 'index']);
            Route::get('/sync-status', [\App\Http\Controllers\Api\Admin\AdminBankDepositController::class, 'syncStatus']);
            Route::post('/{deposit}/confirm', [\App\Http\Controllers\Api\Admin\AdminBankDepositController::class, 'confirm'])->whereNumber('deposit');
        });

        Route::get('/me/permissions', [MePermissionController::class, 'index']);

        Route::prefix('dashboard')->group(function () {
            Route::get('/overview/operation', [AdminDashboardController::class, 'operational']);
            Route::get('/statics/members-static', [AdminMemberStatisticsController::class, 'index']);
            Route::get('/statics/order-static', [AdminDashboardController::class, 'orderStatic']);
            Route::get('/statics/products-static', [AdminProductStatisticsController::class, 'index']);
            Route::get('/statics/payment-static', [AdminPaymentController::class, 'statistics']);
            Route::get('/statics/customer-static', [AdminCustomerController::class, 'statistics']);
            Route::get('/statics/inquiry-static', [AdminInquiryStatisticsController::class, 'index']);
        });

        Route::resource('/export-history', ExportHistoryController::class)->only('show');

        // Order Management (주문관리)
        Route::prefix('orders')->group(function () {
            // 주문 목록 (Order List)
            Route::get('/', [AdminOrderController::class, 'index']);
            Route::get('/design-workflows/assigned-to-me', [AdminOrderDesignWorkflowController::class, 'assignedToMe']);

            // Create internal order (내부 주문 생성)
            Route::post('/internal', [AdminOrderController::class, 'storeInternal']);

            // Bulk actions (Hàng loạt)
            Route::put('/bulk-status-change', [AdminOrderController::class, 'bulkChangeStatus']);
            Route::get('/bulk-design-pdf', [AdminOrderController::class, 'bulkDesignPdf']);
            Route::post('/bulk-print-designs', [AdminOrderController::class, 'bulkPrintDesigns']);

            // Export to Excel
            Route::post('/export-excel', [AdminOrderController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminOrderController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminOrderController::class, 'download'])->where('history', '[0-9]+');

            // 주문 상세 (Order Detail)
            Route::get('/{orderNumber}', [AdminOrderController::class, 'show']);

            // Design assets for order (PDF export flow): preview and layout URLs per item
            // Route::get('/{orderNumber}/design-assets', [AdminOrderController::class, 'designAssets']);

            // Order design as PDF (front + back) – for order list button: view design
            Route::get('/{orderNumber}/design-pdf', [AdminOrderController::class, 'designPdf']);

            // Order status update. FE use PUT .../status with body {"status": "confirmed"}
            Route::put('/{orderNumber}/status', [AdminOrderController::class, 'updateStatus']);

            // Waybill (운송장 번호)
            Route::put('/{orderNumber}/waybill', [AdminOrderController::class, 'updateWaybill']);

            // Basic information (기본정보)
            Route::put('/{orderNumber}/basic-information', [AdminOrderController::class, 'updateBasicInformation']);
            Route::post('/{orderNumber}/adjust-shipping-fee', [AdminOrderController::class, 'adjustShippingFee']);

            // Modification logs (수정 이력)
            Route::get('/{orderNumber}/modification-logs', [AdminOrderController::class, 'modificationLogs']);

            // Status history (상태 이력)
            Route::get('/{orderNumber}/status-history', [AdminOrderController::class, 'statusHistory']);
            Route::get('/{orderNumber}/status-change-history', [AdminOrderController::class, 'statusChangeHistory']);

            // Design file (Cyan file) management - upload revised file, get rejection reason
            Route::get('/{orderNumber}/design-files', [AdminOrderDesignController::class, 'show']);
            // Route::post('/{orderNumber}/design-files/upload', [AdminOrderDesignController::class, 'uploadRevisedFile']);
            // Route::get('/{orderNumber}/design-files/rejection-reason', [AdminOrderDesignController::class, 'getRejectionReason']);
            Route::post('/{orderNumber}/design-files/upload', [AdminOrderDesignController::class, 'resubmitProofFile']);

            // Design service workflow for upload-file orders.
            Route::get('/{orderNumber}/design-workflow', [AdminOrderDesignWorkflowController::class, 'show']);
            Route::post('/{orderNumber}/design-workflow/assignments', [AdminOrderDesignWorkflowController::class, 'assign']);
            Route::post('/{orderNumber}/design-workflow/items/{orderItemId}/drafts', [AdminOrderDesignWorkflowController::class, 'uploadDraft'])->where('orderItemId', '[0-9]+');
            Route::post('/{orderNumber}/design-workflow/review-batches', [AdminOrderDesignWorkflowController::class, 'saveAndSendReview']);
            Route::post('/{orderNumber}/design-workflow/approve', [AdminOrderDesignWorkflowController::class, 'approve']);
        });

        // Shipment Management (출고 관리) - 8.1
        Route::prefix('shipments')->group(function () {
            Route::get('/search-filters', [AdminShipmentController::class, 'searchFilters']);
            Route::get('/', [AdminShipmentController::class, 'index']);
            Route::put('/{shipment}/tracking-number', [AdminShipmentController::class, 'updateTrackingNumber'])->where('shipment', '[0-9]+');
            Route::post('/export-excel', [AdminShipmentController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminShipmentController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminShipmentController::class, 'download'])->where('history', '[0-9]+');
        });

        // Delivery Tracking (배송 추적) - 8.2
        Route::prefix('deliveries')->group(function () {
            Route::prefix('tracking')->group(function () {
                Route::get('/search-filters', [AdminDeliveryTrackingController::class, 'searchFilters']);
                Route::get('/', [AdminDeliveryTrackingController::class, 'index']);
                Route::post('/export-excel', [AdminDeliveryTrackingController::class, 'exportExcel']);
                Route::get('export-excel/{history}/check-progress-status', [AdminDeliveryTrackingController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
                Route::get('export-excel/{history}/download', [AdminDeliveryTrackingController::class, 'download'])->where('history', '[0-9]+');
                Route::get('/{invoiceNumber}', [AdminDeliveryTrackingController::class, 'show']);
            });
        });

        // Shipping Settings (배송 설정 - Free shipping date range)
        Route::prefix('shipping-settings')->group(function () {
            Route::get('/', [AdminShippingSettingController::class, 'show']);
            Route::put('/', [AdminShippingSettingController::class, 'update']);
        });

        Route::prefix('company-settings')->group(function () {
            Route::get('/', [AdminCompanySettingsController::class, 'show']);
            Route::put('/', [AdminCompanySettingsController::class, 'update']);
            Route::post('/stamp', [AdminCompanySettingsController::class, 'uploadStamp']);
            Route::get('/stamp', [AdminCompanySettingsController::class, 'showStamp'])
                ->name('admin.company-settings.stamp.show');
            Route::delete('/stamp', [AdminCompanySettingsController::class, 'destroyStamp']);
        });

        Route::prefix('transaction-settings')->group(function () {
            Route::get('/', [AdminTransactionSettingsController::class, 'show']);
            Route::put('/', [AdminTransactionSettingsController::class, 'update']);
            Route::post('/logo', [AdminTransactionSettingsController::class, 'uploadLogo']);
        });

        Route::prefix('user')->group(function () {
            // 검색 필터 옵션 (Search Filter Options)
            Route::get('/search-filters', [AdminUserController::class, 'searchFilters']);

            // 사용자 목록 (User List)
            Route::get('/', [AdminUserController::class, 'index']);

            // 사용자 생성 (Create User)
            Route::post('/', [AdminUserController::class, 'store']);

            // 사용자 상세 (User Detail)
            Route::get('/{id}', [AdminUserController::class, 'show'])->where('id', '[0-9]+');

            // 사용자 수정 (Update User)
            Route::patch('/{id}', [AdminUserController::class, 'update'])->where('id', '[0-9]+');

            // 사용자 삭제 (Delete User)
            Route::delete('/{id}', [AdminUserController::class, 'destroy'])->where('id', '[0-9]+');

            // 비밀번호 변경 (Change Password)
            Route::put('/{id}/password', [AdminUserController::class, 'changePassword'])->where('id', '[0-9]+');
        });

        Route::prefix('order-extra-entries')->group(function () {
            Route::get('/', [AdminOrderExtraEntryController::class, 'index']);

            Route::get('/{id}', [AdminOrderExtraEntryController::class, 'show'])->where('id', '[0-9]+|[\w-]+');

            Route::post('/', [AdminOrderExtraEntryController::class, 'store']);

            Route::patch('/{id}', action: [AdminOrderExtraEntryController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            Route::delete('/{id}', action: [AdminOrderExtraEntryController::class, 'destroy'])->where('id', '[0-9]+|[\w-]+');
        });

        Route::prefix('user-guide')->group(function () {
            Route::get('/', [AdminUserGuideController::class, 'index']);

            Route::get('/{id}', [AdminUserGuideController::class, 'show'])->where('id', '[0-9]+|[\w-]+');

            Route::post('/', [AdminUserGuideController::class, 'store']);

            Route::patch('/{id}', [AdminUserGuideController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            Route::delete('/{id}', [AdminUserGuideController::class, 'destroy'])->where('id', '[0-9]+|[\w-]+');
        });

        // Member Management (회원 관리)
        Route::prefix('members')->group(function () {
            // Search Filters (검색 필터)
            Route::get('/search-filters', [AdminMemberController::class, 'searchFilters']);

            // Member List (회원 목록)
            Route::get('/', [AdminMemberController::class, 'index']);

            // Member Registration (회원 등록)
            Route::post('/', [AdminMemberController::class, 'store']);

            // Order on behalf / Login as customer. The returned token is short-lived and audited.
            Route::post('/{user}/proxy-login', [AdminMemberController::class, 'proxyLogin'])->whereNumber('user');

            // Member Payments (회원 결제 목록)
            Route::get('/{id}/payments', [AdminMemberController::class, 'payments'])->where('id', '[0-9]+');

            // Export to Excel
            Route::post('/export-excel', [AdminMemberController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminMemberController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminMemberController::class, 'download'])->where('history', '[0-9]+');

            // Member Detail (회원 상세)
            Route::get('/{id}', [AdminMemberController::class, 'show'])->where('id', '[0-9]+|[\w-]+');

            // Member Update (회원 수정)
            Route::put('/{id}', [AdminMemberController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            // Basic Information (기본정보)
            Route::put('/{id}/basic-information', [AdminMemberController::class, 'updateBasicInfo'])->where('id', '[0-9]+|[\w-]+');

            // Permission Information (권한 정보)
            Route::get('/{id}/permissions', [AdminMemberController::class, 'getPermissions'])->where('id', '[0-9]+|[\w-]+');
            Route::put('/{id}/permissions', [AdminMemberController::class, 'updatePermissions'])->where('id', '[0-9]+|[\w-]+');
            Route::post('/{id}/approve', [AdminMemberController::class, 'approve'])->where('id', '[0-9]+|[\w-]+');
            Route::post('/{id}/reject', [AdminMemberController::class, 'reject'])->where('id', '[0-9]+|[\w-]+');
            Route::post('/{id}/change-password', [AdminMemberController::class, 'changePassword'])->where('id', '[0-9]+|[\w-]+');

            // Activity Log (활동 이력)
            Route::get('/{id}/activity-logs', [AdminMemberController::class, 'activityLogs'])->where('id', '[0-9]+|[\w-]+');
        });

        Route::delete('/proxy-login-sessions/{session}/end', [AdminMemberController::class, 'endProxyLogin'])
            ->whereNumber('session');

        // Member Statistics (회원 통계)
        Route::prefix('member-statistics')->group(function () {
            // New Members (신규 회원)
            Route::get('/new-members', [AdminMemberStatisticsController::class, 'newMembers']);

            // Withdrawn Members (탈퇴 회원)
            Route::get('/withdrawn-members', [AdminMemberStatisticsController::class, 'withdrawnMembers']);

            // Active Members (활성 회원)
            Route::get('/active-members', [AdminMemberStatisticsController::class, 'activeMembers']);

            // Members by Level (회원 등급별)
            Route::get('/members-by-level', [AdminMemberStatisticsController::class, 'membersByLevel']);

            // Members by Path (회원 경로별)
            Route::get('/members-by-path', [AdminMemberStatisticsController::class, 'membersByPath']);

            // Export to Excel
            Route::get('/export', [AdminMemberStatisticsController::class, 'export']);
        });

        // Membership Management (멤버십 관리) - Response: AdminMembershipResource
        Route::prefix('memberships')->group(function () {
            // 멤버십 등급 목록 (All Membership Tiers)
            Route::get('/', [AdminMembershipController::class, 'index']);

            // 멤버십 등급 상세 (Membership Tier Detail)
            Route::get('/{id}', [AdminMembershipController::class, 'show'])->where('id', '[0-9]+');

            // 멤버십 등급 수정 (Update Membership Tier)
            Route::put('/{id}', [AdminMembershipController::class, 'update'])->where('id', '[0-9]+');

            // 멤버십 수동 변경 (Manual member upgrade - regardless of order amount)
            Route::post('/members/upgrade', [AdminMembershipController::class, 'upgradeMember']);
        });

        // Coupon Management (쿠폰 관리)
        Route::prefix('coupons')->group(function () {
            Route::get('/search-filters', [AdminCouponController::class, 'searchFilters']);
            Route::get('/', [AdminCouponController::class, 'index']);
            Route::post('/', [AdminCouponController::class, 'store']);
            Route::get('/{id}/issuances', [AdminCouponController::class, 'issuances'])->where('id', '[0-9]+');
            Route::get('/{id}', [AdminCouponController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminCouponController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminCouponController::class, 'destroy'])->where('id', '[0-9]+');
            Route::patch('/{id}/status', [AdminCouponController::class, 'updateStatus'])->where('id', '[0-9]+');
            Route::post('/{id}/issue', [AdminCouponController::class, 'issue'])->where('id', '[0-9]+');
        });

        // Customer Management (고객사 관리)
        Route::prefix('customers')->group(function () {
            // Customer Registration (고객사 등록)
            Route::post('/', [AdminCustomerController::class, 'store']);

            // All customers minimal list for dropdowns (페이지네이션 없는 전체 목록)
            Route::get('/all', [AdminCustomerController::class, 'all']);

            // Customer List (고객사 목록)
            Route::get('/', [AdminCustomerController::class, 'index']);

            // Search Filters (검색 필터)
            Route::get('/search-filters', [AdminCustomerController::class, 'searchFilters']);

            Route::get('/for-member-registration', [AdminCustomerController::class, 'forMemberRegistration']);

            Route::post('/check-access-code', [AdminCustomerController::class, 'checkAccessCode']);

            Route::post('/approval', [AdminCustomerController::class, 'approval']);

            Route::get('/approve-requests', [AdminCustomerController::class, 'getApproveRequests']);

            Route::get('/approval-histories', [AdminCustomerController::class, 'getApprovalHistories']);

            // Customer Detail (고객사 상세)
            Route::get('/{id}', [AdminCustomerController::class, 'show'])->where('id', '[0-9]+|[\w-]+');

            // Customer with members (고객사 + 회원 목록)
            Route::get('/{id}/with-members', [AdminCustomerController::class, 'showWithMembers'])->where('id', '[0-9]+');

            // Customer Update (고객사 수정)
            Route::put('/{id}', [AdminCustomerController::class, 'update'])->where('id', '[0-9]+|[\w-]+');
            Route::patch('/{id}', [AdminCustomerController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            Route::post('/{id}/logo-upload', [AdminCustomerController::class, 'uploadLogo'])->where('id', '[0-9]+|[\w-]+');

            Route::get('/{id}/members', [AdminCustomerController::class, 'getMembers'])->where('id', '[0-9]+|[\w-]+');

            // Payment Information (결제 정보)
            Route::get('/{id}/payment-information', [AdminCustomerController::class, 'getPaymentInformation'])->where('id', '[0-9]+');

            // Bookkeeping / Ledger (장부)
            Route::get('/{id}/bookkeeping', [AdminCustomerController::class, 'getBookkeeping'])->where('id', '[0-9]+');
            Route::post('/{id}/bookkeeping/export', [AdminCustomerController::class, 'exportBookkeeping'])->where('id', '[0-9]+');

            // Audit logs (편집 이력)
            Route::get('/{id}/audit-logs', [AdminCustomerController::class, 'auditLogs'])->where('id', '[0-9]+');

            // Exposure Control (노출 제어) - Promotional Products
            Route::get('/{id}/promotional-products', [AdminCustomerController::class, 'getPromotionalProducts'])->where('id', '[0-9]+|[\w-]+');
            Route::put('/{id}/promotional-products', [AdminCustomerController::class, 'updatePromotionalProducts'])->where('id', '[0-9]+|[\w-]+');

            // Export to Excel
            Route::post('/export-excel', [AdminCustomerController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminCustomerController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminCustomerController::class, 'download'])->where('history', '[0-9]+');
        });

        Route::prefix('/codes')->group(function () {
            Route::get('/', [AdminCodeController::class, 'index']);
        });

        // Product Management (제품관리)
        Route::prefix('products')->group(function () {
            // Search Filters (검색 필터)
            Route::get('/search-filters', [AdminProductController::class, 'searchFilters']);

            // ERP Option Groups (for product creation form)
            Route::get('/erp-option-groups', [AdminProductController::class, 'getErpOptionGroups']);

            // 제품 목록 (Product List) - 템플릿, 맞춤제품, 홍보물, 파일주문
            Route::get('/', [AdminProductController::class, 'index']);

            // 제품 생성 (Create Product)
            Route::post('/', [AdminProductController::class, 'store']);

            // Export to Excel
            Route::post('/export-excel', [AdminProductController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminProductController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminProductController::class, 'download'])->where('history', '[0-9]+');

            // 제품 수정 (Update Product)
            Route::put('/{id}', [AdminProductController::class, 'update'])->where('id', '[0-9]+|[\w-]+');
            Route::patch('/{id}', [AdminProductController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            // 제품 삭제 (Delete Product)
            Route::delete('/{id}', [AdminProductController::class, 'destroy'])->where('id', '[0-9]+|[\w-]+');

            // 제품 상태 변경 (Toggle Product Status)
            Route::patch('/{id}/toggle-status', [AdminProductController::class, 'toggleStatus'])->where('id', '[0-9]+|[\w-]+');

            // 제품 복사 미리보기 / 복사 (Copy Preview / Copy)
            Route::get('/{id}/copy-preview', [AdminProductController::class, 'copyPreview'])->where('id', '[0-9]+|[\w-]+');
            Route::post('/{id}/copy', [AdminProductController::class, 'copy'])->where('id', '[0-9]+|[\w-]+');

            // 제품 상세 (Product Detail)
            Route::get('/{id}', [AdminProductController::class, 'show'])->where('id', '[0-9]+|[\w-]+');

            // // 제품 이미지 업로드 (Upload Product Images)
            Route::post('/upload-images', [AdminProductController::class, 'uploadImages']);

            // // 제품 이미지 삭제 (Delete Product Images)
            // Route::delete('/{id}/images', [AdminProductController::class, 'deleteImages'])->where('id', '[0-9]+|[\w-]+');

            // 제품 일괄 작업 (Bulk Operations)
            Route::patch('/bulk/status', [AdminProductController::class, 'bulkUpdateStatus']);
            Route::delete('/bulk', [AdminProductController::class, 'bulkDelete']);
        });

        // Product Statistics (제품 통계)
        Route::prefix('stastics/products-static')->group(function () {
            // Get sales volume by product
            Route::get('/sales-volume', [AdminProductStatisticsController::class, 'salesVolume']);

            // Get top N sales products
            Route::get('/top-n-sales', [AdminProductStatisticsController::class, 'topNSales']);

            // Get promoted products CTR
            Route::get('/promoted-products-ctr', [AdminProductStatisticsController::class, 'promotedProductsCTR']);

            // Get statistics by product status
            Route::get('/statistics-by-status', [AdminProductStatisticsController::class, 'statisticsByStatus']);
        });

        // ERP Option Groups Management (ERP 옵션 그룹 관리)
        Route::prefix('erp-option-groups')->group(function () {
            Route::get('/search-filters', [AdminErpOptionGroupController::class, 'searchFilters']);
            Route::get('/', [AdminErpOptionGroupController::class, 'index']);
            Route::post('/', [AdminErpOptionGroupController::class, 'store']);
            Route::get('/{id}', [AdminErpOptionGroupController::class, 'show']);
            Route::put('/{id}', [AdminErpOptionGroupController::class, 'update']);
            Route::delete('/{id}', [AdminErpOptionGroupController::class, 'destroy']);
            Route::post('/export-excel', [AdminErpOptionGroupController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminErpOptionGroupController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminErpOptionGroupController::class, 'download'])->where('history', '[0-9]+');
        });

        // ERP Options Management (ERP 옵션 관리)
        Route::prefix('erp-options')->group(function () {
            Route::get('/search-filters', [AdminErpOptionController::class, 'searchFilters']);
            Route::get('/', [AdminErpOptionController::class, 'index']);
            Route::post('/', [AdminErpOptionController::class, 'store']);
            Route::get('/{id}', [AdminErpOptionController::class, 'show']);
            Route::put('/{id}', [AdminErpOptionController::class, 'update']);
            Route::delete('/{id}', [AdminErpOptionController::class, 'destroy']);
            Route::post('/export-excel', [AdminErpOptionController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminErpOptionController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminErpOptionController::class, 'download'])->where('history', '[0-9]+');
        });

        // Template Management (템플릿 관리)
        Route::prefix('templates')->group(function () {
            // Search Filters (검색 필터)
            Route::get('/search-filters', [AdminTemplateController::class, 'searchFilters']);

            // Upload template file (AI/PDF only). Returns file_path for template create/update.
            Route::post('/upload-file', [AdminTemplateController::class, 'uploadFile']);
            // Preview images upload (max 2 images). Returns paths for preview_images field.
            Route::post('/preview-images', [AdminTemplateController::class, 'uploadPreviewImages']);

            // 템플릿 목록 (Template List)
            Route::get('/', [AdminTemplateController::class, 'index']);

            // 템플릿 생성 (Create Template)
            Route::post('/', [AdminTemplateController::class, 'store']);

            // Export to Excel
            Route::post('/export-excel', [AdminTemplateController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminTemplateController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminTemplateController::class, 'download'])->where('history', '[0-9]+');

            // 템플릿 수정 (Update Template)
            Route::put('/{id}', [AdminTemplateController::class, 'update'])->where('id', '[0-9]+');
            Route::patch('/{id}', [AdminTemplateController::class, 'update'])->where('id', '[0-9]+');

            // 템플릿 삭제 (Delete Template)
            Route::delete('/{id}', [AdminTemplateController::class, 'destroy'])->where('id', '[0-9]+');

            // 템플릿 복사 미리보기 / 복사 (Copy Preview / Copy)
            Route::get('/{id}/copy-preview', [AdminTemplateController::class, 'copyPreview'])->where('id', '[0-9]+');
            Route::post('/{id}/copy', [AdminTemplateController::class, 'copy'])->where('id', '[0-9]+');

            // 템플릿 상세 (Template Detail)
            Route::get('/{id}', [AdminTemplateController::class, 'show'])->where('id', '[0-9]+');
        });

        Route::prefix('colors')->group(function () {
            Route::get('/', [AdminColorController::class, 'index']);
            Route::post('/', [AdminColorController::class, 'store']);

            Route::put('/{id}', action: [AdminColorController::class, 'update'])->where('id', '[0-9]+|[\w-]+');

            Route::delete('/{id}', action: [AdminColorController::class, 'destroy'])->where('id', '[0-9]+|[\w-]+');
        });

        // Management Payments
        Route::prefix('payments')->group(function () {
            Route::get('/', [AdminPaymentController::class, 'index']);
            Route::get('/statistics', [AdminPaymentController::class, 'statistics']);
            Route::post('/export-excel', [AdminPaymentController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminPaymentController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminPaymentController::class, 'download'])->where('history', '[0-9]+');
            Route::get('/{id}', [AdminPaymentController::class, 'show'])->where('id', '[0-9]+');
            Route::get('/{id}/receipt', [AdminPaymentController::class, 'printReceipt'])->where('id', '[0-9]+');
            Route::post('/{transactionId}/refund', [AdminPaymentController::class, 'refund']);
        });

        // Settlement Report Management
        Route::prefix('settlement-report')->group(function () {
            Route::get('/', [AdminSettlementReportController::class, 'index']);
            Route::post('/export-excel', [AdminSettlementReportController::class, 'exportExcel']);
            Route::get('/export-excel/{history}/check-progress-status', [AdminSettlementReportController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('/export-excel/{history}/download', [AdminSettlementReportController::class, 'download'])->where('history', '[0-9]+');
        });

        // Point routes - Response: AdminPointTransactionResource
        Route::prefix('points')->group(function () {
            // Search filter options
            Route::get('/search-filters', [AdminPointController::class, 'searchFilters']);

            // Adjust points (grant/deduct)
            Route::post('/adjust', [AdminPointController::class, 'adjust']);

            // Get user point balance
            Route::get('/balance/{userId}', [AdminPointController::class, 'getUserBalance']);

            // Point usage history
            Route::get('/history', [AdminPointController::class, 'history']);
        });

        // Point Settings Management (포인트 설정 관리) - Response: AdminPointSettingResource
        Route::prefix('point-settings')->group(function () {
            Route::get('/', [AdminPointSettingsController::class, 'index']);
            Route::put('/', [AdminPointSettingsController::class, 'update']);
        });

        // Management User Limit
        Route::apiResource('user-limits', AdminUserLimitManagementController::class);
        Route::prefix('user-limits')->group(function () {
            Route::get('/{user_limit}/history', [AdminUserLimitManagementController::class, 'history'])->where('user_limit', '[0-9]+|[^/]+');
        });

        // Administrator Permission Management (관리자 권한 관리 - Super Admin)
        Route::prefix('permissions')->group(function () {
            Route::get('/search-filters', [AdminPermissionController::class, 'searchFilters']);
            Route::get('/', [AdminPermissionController::class, 'index']);
            Route::post('/', [AdminPermissionController::class, 'store']);
            Route::get('/{id}/menu-structure', [AdminPermissionController::class, 'menuStructure'])->where('id', '[0-9]+');
            Route::put('/{id}/settings', [AdminPermissionController::class, 'updateSettings'])->where('id', '[0-9]+');
            Route::get('/{id}', [AdminPermissionController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminPermissionController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminPermissionController::class, 'destroy'])->where('id', '[0-9]+');
            Route::post('/{id}/copy', [AdminPermissionController::class, 'copy'])->where('id', '[0-9]+');
            Route::post('/export-excel', [AdminPermissionController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminPermissionController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminPermissionController::class, 'download'])->where('history', '[0-9]+');

            // Permission User Management
            Route::get('/{id}/users', [AdminPermissionController::class, 'users'])->where('id', '[0-9]+');
            Route::post('/{id}/users', [AdminPermissionController::class, 'addUsers'])->where('id', '[0-9]+');
            Route::delete('/{id}/users', [AdminPermissionController::class, 'removeUsers'])->where('id', '[0-9]+');
            Route::get('/{id}/available-users', [AdminPermissionController::class, 'availableUsers'])->where('id', '[0-9]+');
        });

        // Category Management (카테고리 관리 - Super Admin)
        Route::prefix('categories')->group(function () {
            Route::get('/search-filters', [AdminCategoryController::class, 'searchFilters']);
            Route::post('/upload-exposure-image', [AdminCategoryController::class, 'uploadExposureImage']);
            Route::get('/', [AdminCategoryController::class, 'index']);
            Route::post('/', [AdminCategoryController::class, 'store']);
            Route::put('/sort-order', [AdminCategoryController::class, 'updateSortOrder']);
            Route::post('/export-excel', [AdminCategoryController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminCategoryController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminCategoryController::class, 'download'])->where('history', '[0-9]+');
            Route::get('/{id}', [AdminCategoryController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminCategoryController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminCategoryController::class, 'destroy'])->where('id', '[0-9]+');
            Route::put('/{id}/exposure', [AdminCategoryController::class, 'updateExposure'])->where('id', '[0-9]+');
        });

        // Editor Size Type Management (에디터 사이즈 타입 관리 - Super Admin)
        Route::prefix('editor-size-types')->group(function () {
            Route::get('/', [AdminEditorSizeTypeController::class, 'index']);
            Route::post('/', [AdminEditorSizeTypeController::class, 'store']);
            Route::get('/{id}', [AdminEditorSizeTypeController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminEditorSizeTypeController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminEditorSizeTypeController::class, 'destroy'])->where('id', '[0-9]+');
            Route::put('/sort-order', [AdminEditorSizeTypeController::class, 'reorder']);
        });

        Route::prefix('editor-sizes')->group(function () {
            Route::get('/', [AdminEditorSizeController::class, 'index']);
            Route::post('/', [AdminEditorSizeController::class, 'store']);
            Route::get('/{id}', [AdminEditorSizeController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminEditorSizeController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminEditorSizeController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Web Editor Management (웹 에디터 관리 - Super Admin)
        Route::prefix('web-editors')->group(function () {
            Route::get('/search-filters', [AdminWebEditorController::class, 'searchFilters']);
            Route::get('/', [AdminWebEditorController::class, 'index']);
            Route::post('/', [AdminWebEditorController::class, 'store']);
            Route::get('/{id}', [AdminWebEditorController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminWebEditorController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminWebEditorController::class, 'destroy'])->where('id', '[0-9]+');
            Route::get('/{id}/templates', [AdminWebEditorController::class, 'templates'])->where('id', '[0-9]+');
        });

        Route::prefix('unit-prices')->group(function () {
            Route::get('/', [AdminUnitPriceController::class, 'index']);
            Route::post('/', [AdminUnitPriceController::class, 'store']);
            Route::get('/{id}', [AdminUnitPriceController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminUnitPriceController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminUnitPriceController::class, 'destroy'])->where('id', '[0-9]+');
            Route::patch('/{id}/toggle-status', [AdminUnitPriceController::class, 'toggleStatus'])->where('id', '[0-9]+');

            Route::get('/{unitPriceId}/items', [AdminUnitPriceController::class, 'items'])->where('unitPriceId', '[0-9]+');
            Route::post('/{unitPriceId}/items', [AdminUnitPriceController::class, 'storeItem'])->where('unitPriceId', '[0-9]+');
            Route::put('/items/{id}', [AdminUnitPriceController::class, 'updateItem'])->where('id', '[0-9]+');
            Route::delete('/items/{id}', [AdminUnitPriceController::class, 'destroyItem'])->where('id', '[0-9]+');
        });

        Route::prefix('pricing')->group(function () {
            Route::get('/profiles', [AdminPricingController::class, 'profiles']);
            Route::post('/profiles', [AdminPricingController::class, 'storeProfile']);
            Route::get('/profiles/{pricingProfile}', [AdminPricingController::class, 'showProfile']);
            Route::patch('/profiles/{pricingProfile}', [AdminPricingController::class, 'updateProfile']);
            Route::delete('/profiles/{pricingProfile}', [AdminPricingController::class, 'destroyProfile']);
        });

        // Post Processing Price Management (후가공 단가 관리 - Super Admin)
        Route::prefix('post-processing-prices')->group(function () {
            Route::get('/', [AdminPostProcessingPriceController::class, 'index']);
            Route::post('/', [AdminPostProcessingPriceController::class, 'store']);
            Route::get('/{id}', [AdminPostProcessingPriceController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminPostProcessingPriceController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminPostProcessingPriceController::class, 'destroy'])->where('id', '[0-9]+');
            Route::patch('/{id}/toggle-status', [AdminPostProcessingPriceController::class, 'toggleStatus'])->where('id', '[0-9]+');

            Route::get('/{postProcessingPriceId}/items', [AdminPostProcessingPriceController::class, 'items'])->where('postProcessingPriceId', '[0-9]+');
            Route::post('/{postProcessingPriceId}/items', [AdminPostProcessingPriceController::class, 'storeItem'])->where('postProcessingPriceId', '[0-9]+');
            Route::put('/items/{id}', [AdminPostProcessingPriceController::class, 'updateItem'])->where('id', '[0-9]+');
            Route::delete('/items/{id}', [AdminPostProcessingPriceController::class, 'destroyItem'])->where('id', '[0-9]+');
        });

        // Paper Management (용지 관리 - Super Admin)
        Route::prefix('papers')->group(function () {
            Route::get('/', [AdminPaperController::class, 'index']);
            Route::post('/', [AdminPaperController::class, 'store']);
            Route::get('/{id}', [AdminPaperController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminPaperController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminPaperController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Size Option Management (사이즈 옵션 관리 - Super Admin)
        Route::prefix('size-options')->group(function () {
            Route::get('/', [AdminSizeOptionController::class, 'index']);
            Route::post('/', [AdminSizeOptionController::class, 'store']);
            Route::get('/{id}', [AdminSizeOptionController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminSizeOptionController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminSizeOptionController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Product Option Group Management (제품 옵션 그룹 관리 - Super Admin)
        Route::prefix('product-option-groups')->group(function () {
            Route::get('/', [AdminProductOptionGroupController::class, 'index']);
            Route::post('/', [AdminProductOptionGroupController::class, 'store']);
            Route::get('/{id}', [AdminProductOptionGroupController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminProductOptionGroupController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminProductOptionGroupController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Product Option Management (제품 옵션 관리 - Super Admin)
        Route::prefix('product-options')->group(function () {
            Route::get('/', [AdminProductOptionController::class, 'index']);
            Route::post('/', [AdminProductOptionController::class, 'store']);
            Route::get('/{id}', [AdminProductOptionController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminProductOptionController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminProductOptionController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // User Permission Management (사용자 권한 관리 - Super Admin)
        Route::prefix('user-permissions')->group(function () {
            Route::get('/', [AdminUserPermissionController::class, 'index']);
            Route::get('/{id}', [AdminUserPermissionController::class, 'show'])->where('id', '[0-9]+');
            Route::post('/', [AdminUserPermissionController::class, 'store']);
            Route::put('/{id}', [AdminUserPermissionController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminUserPermissionController::class, 'destroy'])->where('id', '[0-9]+');
            Route::post('/export-excel', [AdminUserPermissionController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminUserPermissionController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminUserPermissionController::class, 'download'])->where('history', '[0-9]+');
        });

        // Notice Management (공지사항 관리 - Super Admin)
        Route::prefix('notices')->group(function () {
            Route::get('/search-filters', [AdminNoticeController::class, 'searchFilters']);
            Route::post('/upload-attachment', [AdminNoticeController::class, 'uploadAttachment']);
            Route::get('/', [AdminNoticeController::class, 'index']);
            Route::post('/', [AdminNoticeController::class, 'store']);
            Route::get('/{id}', [AdminNoticeController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminNoticeController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminNoticeController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Board Notice Config Management (게시판 공지 설정 관리)
        Route::prefix('board-notice-configs')->group(function () {
            Route::get('/', [AdminBoardNoticeConfigController::class, 'index']);
            Route::put('/{boardType}', [AdminBoardNoticeConfigController::class, 'update']);
        });

        // File Management (파일 관리 - Super Admin)
        Route::prefix('files')->group(function () {
            Route::get('/search-filters', [AdminFileController::class, 'searchFilters']);
            Route::get('/', [AdminFileController::class, 'index']);
            Route::post('/', [AdminFileController::class, 'upload']);
            Route::get('/{id}', [AdminFileController::class, 'show'])->where('id', '[0-9]+');
        });

        // Guide Content Management (안내 관리 - Super Admin)
        Route::prefix('guide-contents')->group(function () {
            Route::get('/search-filters', [AdminGuideContentController::class, 'searchFilters']);
            Route::post('/upload-attachment', [AdminGuideContentController::class, 'uploadAttachment']);
            Route::get('/', [AdminGuideContentController::class, 'index']);
            Route::post('/', [AdminGuideContentController::class, 'store']);
            Route::get('/{id}', [AdminGuideContentController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminGuideContentController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminGuideContentController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Shopping Settings Management (쇼핑 설정 관리 - Super Admin)
        Route::prefix('shopping-settings')->group(function () {
            Route::get('/', [AdminShoppingSettingController::class, 'index']);
            Route::get('/{id}', [AdminShoppingSettingController::class, 'show'])->where('id', '[0-9]+');
            Route::post('/', [AdminShoppingSettingController::class, 'store']);
            Route::put('/{id}', [AdminShoppingSettingController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminShoppingSettingController::class, 'destroy'])->where('id', '[0-9]+');
            Route::get('/{settingId}/items', [AdminShoppingSettingItemController::class, 'index'])->where('settingId', '[0-9]+');
        });

        // Shopping Setting Items Management (쇼핑 설정 세부 항목 관리 - Super Admin)
        Route::prefix('shopping-setting-items')->group(function () {
            Route::get('/', [AdminShoppingSettingItemController::class, 'index']);
            Route::post('/', [AdminShoppingSettingItemController::class, 'store']);
            Route::get('/{id}', [AdminShoppingSettingItemController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminShoppingSettingItemController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminShoppingSettingItemController::class, 'destroy'])->where('id', '[0-9]+');
            Route::patch('/{id}/default', [AdminShoppingSettingItemController::class, 'setDefault'])->where('id', '[0-9]+');
        });

        // Banner Management (배너 관리 - Super Admin)
        Route::prefix('banners')->group(function () {
            Route::get('/search-filters', [AdminBannerController::class, 'searchFilters']);
            Route::post('/upload-image', [AdminBannerController::class, 'uploadImage']);
            Route::get('/', [AdminBannerController::class, 'index']);
            Route::post('/', [AdminBannerController::class, 'store']);
            Route::get('/{id}', [AdminBannerController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminBannerController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminBannerController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Pop-up Management (팝업 관리 - Super Admin)
        Route::prefix('popups')->group(function () {
            Route::get('/search-filters', [AdminPopupController::class, 'searchFilters']);
            Route::post('/upload-image', [AdminPopupController::class, 'uploadImage']);
            Route::get('/', [AdminPopupController::class, 'index']);
            Route::post('/', [AdminPopupController::class, 'store']);
            Route::get('/{id}', [AdminPopupController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminPopupController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminPopupController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // FAQ Management (FAQ 관리 - Super Admin)
        Route::prefix('faq')->group(function () {
            Route::get('/search-filters', [AdminFaqController::class, 'searchFilters']);
            Route::get('/', [AdminFaqController::class, 'index']);
            Route::post('/', [AdminFaqController::class, 'store']);
            Route::get('/{id}', [AdminFaqController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminFaqController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminFaqController::class, 'destroy'])->where('id', '[0-9]+');
        });

        Route::prefix('direct-shipping')->group(function () {
            Route::get('/search-filters', [AdminDirectShippingController::class, 'searchFilters']);
            Route::get('/', [AdminDirectShippingController::class, 'index']);
            Route::get('/{id}', [AdminDirectShippingController::class, 'show']);
            Route::post('/{id}/status', [AdminDirectShippingController::class, 'updateStatus']);
        });

        // Manage Notifications (알림 관리 - Super Admin)
        Route::prefix('notifications')->group(function () {
            // Notification Templates
            Route::prefix('templates')->group(function () {
                Route::get('/search-filters', [AdminNotificationTemplateController::class, 'searchFilters']);
                Route::get('/', [AdminNotificationTemplateController::class, 'index']);
                Route::post('/', [AdminNotificationTemplateController::class, 'store']);
                Route::get('/{id}', [AdminNotificationTemplateController::class, 'show'])->where('id', '[0-9]+');
                Route::put('/{id}', [AdminNotificationTemplateController::class, 'update'])->where('id', '[0-9]+');
                Route::delete('/{id}', [AdminNotificationTemplateController::class, 'destroy'])->where('id', '[0-9]+');
                Route::post('/{id}/copy', [AdminNotificationTemplateController::class, 'copy'])->where('id', '[0-9]+');
                Route::put('/{id}/toggle-status', [AdminNotificationTemplateController::class, 'toggleStatus'])->where('id', '[0-9]+');
            });

            // Notification Sending History
            Route::prefix('history')->group(function () {
                Route::get('/search-filters', [AdminNotificationHistoryController::class, 'searchFilters']);
                Route::get('/', [AdminNotificationHistoryController::class, 'index']);
                Route::get('/{history}', [AdminNotificationHistoryController::class, 'show'])->where('history', '[0-9]+');
                Route::post('/{history}/resend', [AdminNotificationHistoryController::class, 'resend'])->where('history', '[0-9]+');
            });
        });

        // Access Log Management (접속 로그 관리 - Super Admin)
        Route::prefix('access-logs')->group(function () {
            Route::get('/search-filters', [AdminAccessLogController::class, 'searchFilters']);
            Route::get('/', [AdminAccessLogController::class, 'index']);
        });

        // Task Log Management (작업 로그 관리 - Super Admin)
        Route::prefix('task-logs')->group(function () {
            Route::get('/search-filters', [AdminTaskLogController::class, 'searchFilters']);
            Route::get('/', [AdminTaskLogController::class, 'index']);
            Route::post('/export-excel', [AdminTaskLogController::class, 'exportExcel']);
            Route::get('export-excel/{history}/check-progress-status', [AdminTaskLogController::class, 'checkProgressStatus'])->where('history', '[0-9]+');
            Route::get('export-excel/{history}/download', [AdminTaskLogController::class, 'download'])->where('history', '[0-9]+');
        });

        // Administrator Inquiry Management (관리자 1:1 문의 관리 - Admin only)
        Route::prefix('inquiries')->group(function () {
            // Filter metadata
            Route::get('/search-filters', [AdminInquiryController::class, 'filters']);

            // Upload attachment for inquiry reply
            Route::post('/upload-attachment', [AdminInquiryController::class, 'uploadAttachment']);

            // Inquiry List (1:1 문의 목록)
            Route::get('/', [AdminInquiryController::class, 'index']);

            // Export Excel (must be before /{id})
            Route::post('/export-excel', [AdminInquiryController::class, 'exportExcel']);
            Route::get('/export-excel/{history}/check-progress-status', [AdminInquiryController::class, 'checkExportProgress'])->where('history', '[0-9]+');
            Route::get('/export-excel/{history}/download', [AdminInquiryController::class, 'downloadExport'])->where('history', '[0-9]+');

            // Inquiry Detail (1:1 문의 상세)
            Route::get('/{id}', [AdminInquiryController::class, 'show'])->where('id', '[0-9]+');

            // Related inquiries, timeline, replies, audit logs, internal memo
            Route::get('/{id}/related', [AdminInquiryController::class, 'related'])->where('id', '[0-9]+');
            Route::get('/{id}/timeline', [AdminInquiryController::class, 'timeline'])->where('id', '[0-9]+');
            Route::get('/{id}/replies', [AdminInquiryController::class, 'replies'])->where('id', '[0-9]+');
            Route::post('/{id}/replies', [AdminInquiryController::class, 'storeReply'])->where('id', '[0-9]+');
            Route::put('/{id}/replies/{reply}', [AdminInquiryController::class, 'updateReply'])->where(['id' => '[0-9]+', 'reply' => '[0-9]+']);
            Route::delete('/{id}/replies/{reply}', [AdminInquiryController::class, 'deleteReply'])->where(['id' => '[0-9]+', 'reply' => '[0-9]+']);
            Route::get('/{id}/audit-logs', [AdminInquiryController::class, 'auditLogs'])->where('id', '[0-9]+');
            Route::get('/{id}/memo', [AdminInquiryController::class, 'memo'])->where('id', '[0-9]+');
            Route::post('/{id}/memo', [AdminInquiryController::class, 'storeMemo'])->where('id', '[0-9]+');

            // Answer / reply to inquiry (register, edit, delete)
            Route::get('/{id}/answer', [AdminInquiryController::class, 'getAnswer'])->where('id', '[0-9]+');
            Route::post('/{id}/answer', [AdminInquiryController::class, 'answer'])->where('id', '[0-9]+');
            Route::put('/{id}/answer', [AdminInquiryController::class, 'updateAnswer'])->where('id', '[0-9]+');
            Route::delete('/{id}/answer', [AdminInquiryController::class, 'deleteAnswer'])->where('id', '[0-9]+');

            // Status update
            Route::post('/{id}/status', [AdminInquiryController::class, 'updateStatus'])->where('id', '[0-9]+');

            // Assign manager
            Route::post('/{id}/assign', [AdminInquiryController::class, 'assign'])->where('id', '[0-9]+');
        });

        // Outsourcing Management (외주업체 관리)
        Route::prefix('outsourcing-companies')->group(function () {
            Route::get('/', [AdminOutsourcingController::class, 'index']);
            Route::post('/', [AdminOutsourcingController::class, 'store']);
            Route::get('/{id}', [AdminOutsourcingController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminOutsourcingController::class, 'update'])->where('id', '[0-9]+');
            Route::patch('/{id}', [AdminOutsourcingController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminOutsourcingController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Equipment Management (설비 관리)
        Route::prefix('equipments')->group(function () {
            Route::get('/', [AdminEquipmentController::class, 'index']);
            Route::post('/', [AdminEquipmentController::class, 'store']);
            Route::get('/{id}', [AdminEquipmentController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminEquipmentController::class, 'update'])->where('id', '[0-9]+');
            Route::patch('/{id}', [AdminEquipmentController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminEquipmentController::class, 'destroy'])->where('id', '[0-9]+');
            Route::get('/{id}/logs', [AdminEquipmentController::class, 'logs'])->where('id', '[0-9]+');
            Route::post('/{id}/logs', [AdminEquipmentController::class, 'storeLog'])->where('id', '[0-9]+');
            Route::put('/{id}/logs/{logId}', [AdminEquipmentController::class, 'updateLog'])->where(['id' => '[0-9]+', 'logId' => '[0-9]+']);
            Route::patch('/{id}/logs/{logId}', [AdminEquipmentController::class, 'updateLog'])->where(['id' => '[0-9]+', 'logId' => '[0-9]+']);
            Route::delete('/{id}/logs/{logId}', [AdminEquipmentController::class, 'destroyLog'])->where(['id' => '[0-9]+', 'logId' => '[0-9]+']);
            Route::post('/{id}/logs/export-excel', [AdminEquipmentController::class, 'exportLogsExcel'])->where('id', '[0-9]+');
            Route::get('/export-excel/{history}/check-progress-status', [AdminEquipmentController::class, 'checkLogsExportProgress'])->where('history', '[0-9]+');
            Route::get('/export-excel/{history}/download', [AdminEquipmentController::class, 'downloadLogsExport'])->where('history', '[0-9]+');
        });

        // Work Instructions (작업지시서)
        Route::prefix('work-instructions')->group(function () {
            Route::get('/{orderId}/print', [AdminWorkInstructionController::class, 'print'])->where('orderId', '[0-9]+');
            Route::post('/batch-print', [AdminWorkInstructionController::class, 'batchPrint']);
        });

        // Attendance Management (근태 관리)
        Route::prefix('attendances')->group(function () {
            Route::get('/', [AdminAttendanceController::class, 'index']);
            Route::post('/', [AdminAttendanceController::class, 'store']);
            Route::get('/{id}', [AdminAttendanceController::class, 'show'])->where('id', '[0-9]+');
            Route::put('/{id}', [AdminAttendanceController::class, 'update'])->where('id', '[0-9]+');
            Route::patch('/{id}', [AdminAttendanceController::class, 'update'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminAttendanceController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Tax Invoice Management (세금계산서 관리)
        Route::prefix('tax-invoices')->group(function () {
            Route::get('/search-filters', [AdminTaxInvoiceController::class, 'searchFilters']);
            Route::get('/', [AdminTaxInvoiceController::class, 'index']);
            Route::post('/', [AdminTaxInvoiceController::class, 'store']);
            Route::post('/bulk-generate', [AdminTaxInvoiceController::class, 'bulkGenerate']);
            Route::patch('/bulk-status', [AdminTaxInvoiceController::class, 'bulkUpdateStatus']);
            Route::post('/export-excel', [AdminTaxInvoiceController::class, 'exportExcel']);
            Route::get('/export-excel/{historyId}/check-progress-status', [AdminTaxInvoiceController::class, 'checkProgressStatus'])->where('historyId', '[0-9]+');
            Route::get('/export-excel/{historyId}/download', [AdminTaxInvoiceController::class, 'download'])->where('historyId', '[0-9]+');
            Route::patch('/{id}/issue', [AdminTaxInvoiceController::class, 'issue'])->where('id', '[0-9]+');
            Route::patch('/{id}/pending', [AdminTaxInvoiceController::class, 'setPending'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminTaxInvoiceController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Cash Receipt Management (현금영수증 관리)
        Route::prefix('cash-receipts')->group(function () {
            Route::get('/search-filters', [AdminCashReceiptController::class, 'searchFilters']);
            Route::get('/', [AdminCashReceiptController::class, 'index']);
            Route::post('/', [AdminCashReceiptController::class, 'store']);
            Route::post('/bulk-generate', [AdminCashReceiptController::class, 'bulkGenerate']);
            Route::patch('/bulk-status', [AdminCashReceiptController::class, 'bulkUpdateStatus']);
            Route::post('/export-excel', [AdminCashReceiptController::class, 'exportExcel']);
            Route::get('/export-excel/{historyId}/check-progress-status', [AdminCashReceiptController::class, 'checkProgressStatus'])->where('historyId', '[0-9]+');
            Route::get('/export-excel/{historyId}/download', [AdminCashReceiptController::class, 'download'])->where('historyId', '[0-9]+');
            Route::patch('/{id}/issue', [AdminCashReceiptController::class, 'issue'])->where('id', '[0-9]+');
            Route::patch('/{id}/pending', [AdminCashReceiptController::class, 'setPending'])->where('id', '[0-9]+');
            Route::delete('/{id}', [AdminCashReceiptController::class, 'destroy'])->where('id', '[0-9]+');
        });

        // Barcode Scanner (바코드 스캐너 - 주문 상태 자동 변경)
        Route::prefix('barcode')->group(function () {
            Route::post('/scan', [AdminBarcodeController::class, 'scan']);
        });

        // Price Simulation (단가 시뮬레이션)
        Route::prefix('price-simulation')->group(function () {
            Route::post('/', [AdminPriceSimulationController::class, 'index']);
        });

        // Unit Price Change Logs (단가 변경 이력)
        Route::prefix('unit-price-change-logs')->group(function () {
            Route::get('/', [AdminUnitPriceChangeLogController::class, 'index']);
        });

        // Paper Price Management (용지 가격 관리)
        Route::prefix('paper-prices')->group(function () {
            Route::get('/search-filters', [AdminPaperPriceController::class, 'searchFilters']);
            Route::get('/', [AdminPaperPriceController::class, 'index']);
            Route::post('/', [AdminPaperPriceController::class, 'store']);
            Route::get('/{paperPrice}', [AdminPaperPriceController::class, 'show']);
            Route::put('/{paperPrice}', [AdminPaperPriceController::class, 'update']);
            Route::delete('/{paperPrice}', [AdminPaperPriceController::class, 'destroy']);
        });

        Route::prefix('printing-prices')->group(function () {
            Route::get('/', [PrintingPriceController::class, 'index']);
            Route::get('/{id}', [PrintingPriceController::class, 'show']);
            Route::post('/', [PrintingPriceController::class, 'store']);
            Route::put('/{id}', [PrintingPriceController::class, 'update']);
            Route::delete('/{id}', [PrintingPriceController::class, 'destroy']);

            // Printing Price Items
            Route::get('/{printingPriceId}/items', [PrintingPriceController::class, 'items']);
            Route::post('/{printingPriceId}/items', [PrintingPriceController::class, 'storeItem']);
            Route::put('/items/{id}', [PrintingPriceController::class, 'updateItem']);
            Route::delete('/items/{id}', [PrintingPriceController::class, 'destroyItem']);
        });
    });
});
