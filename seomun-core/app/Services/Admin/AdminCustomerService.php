<?php

namespace App\Services\Admin;

use App\Enums\ApprovalStatus;
use App\Enums\CustomerOrderMenu;
use App\Enums\CustomerStatus;
use App\Http\Resources\Admin\AdminCustomerDetailResource;
use App\Http\Resources\Admin\AdminMemberResource;
use App\Models\Code;
use App\Models\Customer;
use App\Models\LimitUsagedLogs;
use Spatie\Activitylog\Models\Activity;
use App\Models\CustomerPromotionalProduct;
use App\Models\Product;
use App\Models\User;
use App\Models\UserLimit;
use App\Services\MembershipService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdminCustomerService
{
    private string $DEFAULT_PASSWORD = 'aktmxj!@#$';

    public function __construct(
        protected MembershipService $membershipService,
    ) {}

    /**
     * Build query for customers with filters.
     * This method is used by both getCustomers and export.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = Customer::query();

        // Search term filter (검색어) - 고객사명, 사업자등록번호, 담당자명
        if (! empty($filters['search_term'])) {
            $search = $filters['search_term'];
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('business_registration_number', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%");
            });
        }

        // Approval status filter (승인상태)
        if (! empty($filters['approval_status'])) {
            $query->where('approval_status', ApprovalStatus::from($filters['approval_status']));
        }

        // Status filter (상태) - active, inactive
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Registration date filter (등록일)
        if (! empty($filters['registration_date_from'])) {
            $query->whereDate('created_at', '>=', $filters['registration_date_from']);
        }
        if (! empty($filters['registration_date_to'])) {
            $query->whereDate('created_at', '<=', $filters['registration_date_to']);
        }

        // Sort
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Map sort field names
        $sortFieldMap = [
            'name' => 'company_name',
            'created_at' => 'created_at',
            'status' => 'status',
        ];

        $sortField = $sortFieldMap[$sortBy] ?? 'created_at';
        $query->orderBy($sortField, $sortOrder);
        $query->with(['code']);

        return $query;
    }

    /**
     * Get customers with filters & pagination
     * 고객사 목록 조회
     */
    public function getCustomers(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);
        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Get single customer detail by ID
     * 고객사 상세 조회
     */
    public function getCustomer(int|string $id): Customer
    {
        try {
            $customer = Customer::query()
                ->with(['approvedBy', 'code', 'user'])
                ->findOrFail($id);

            return $customer;
        } catch (\Exception $e) {
            Log::error('Get Colors failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getCustomerMembers(int $id, int $perPage = 20): LengthAwarePaginator
    {
        try {
            $customer = Customer::query()->findOrFail($id);

            return User::query()
                ->where(['customer_id' => $customer->id])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        } catch (\Exception $e) {
            Log::error('Get Colors failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getCustomersForMemberRegistration(User $user): array
    {
        try {
            $query = Customer::query();

            $customers = $query->where('signup_enabled', true)
                ->where('status', CustomerStatus::ACTIVE->value)
                ->select(['id', 'company_name'])
                ->get();

            return $customers->toArray();
        } catch (\Exception $e) {
            Log::error('Get Customers for Member Registration failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get search filters metadata
     * 검색 필터 메타데이터 조회
     */
    public function getSearchFilters(): array
    {
        return [
            'approval_status_options' => $this->getApprovalStatusOptions(),
            'status_options' => $this->getStatusOptions(),
            'main_menu_options' => $this->getMainMenuOptions(),
            'branch_in_charge_options' => $this->getBranchInChargeOptions(),
            'sort_options' => [
                ['value' => 'created_at', 'label' => '등록일'],
                ['value' => 'name', 'label' => '고객사명'],
                ['value' => 'status', 'label' => '상태'],
                ['value' => 'access_code', 'label' => '접속코드'],
                ['value' => 'branch_in_charge', 'label' => '담당지점'],
                ['value' => 'main_menu', 'label' => '주요메뉴'],
                ['value' => 'site_version', 'label' => '사이트버전'],
            ],
        ];
    }

    /**
     * Create customer
     */
    public function createCustomer(array $data, User $adminUser): Customer
    {
        try {
            DB::beginTransaction();

            $accessCode = $this->generateUniqueCustomerAccessCode();

            $customer = Customer::create([
                'access_code' => $accessCode,
                'api_key' => Str::random(64),
                'webhook_secret' => Str::random(64),
                'company_name' => $data['company_name'],
                'business_registration_number' => $data['business_registration_number'] ?? null,
                'business_registration_file' => $data['business_registration_file'] ?? null,
                'representative_name' => $data['representative_name'] ?? null,
                'contact_name' => $data['name'] ?? null,
                'contact_phone' => $data['contact_phone'] ?? null,
                'contact_mobile' => $data['mobile'] ?? null,
                'contact_email' => $data['contact_email'] ?? null,
                'business_type' => $data['business_type'] ?? null,
                'business_items' => $data['business_items'] ?? null,
                'postcode' => $data['business_postcode'] ?? null,
                'address' => $data['business_address'] ?? null,
                'detailed_address' => $data['business_detailed_address'] ?? null,
                'tax_invoice_email' => $data['tax_invoice_email'] ?? null,
                'homepage_url' => $data['homepage_url'] ?? null,
                'shipping_fee_applied' => 'none',
                'order_menus' => '[]',
                'other_menus' => '[]',
                'approval_status' => ApprovalStatus::ACCEPTED,
                'status' => CustomerStatus::ACTIVE,
                'approved_by' => $adminUser->id,
                'approved_at' => now(),
            ]);

            $masterUser = User::create([
                'member_type' => $data['member_type'] ?? 'business',
                'username' => $data['username'] ?? ($accessCode . '_admin'),
                'customer_id' => $customer->id,
                'name' => $data['name'] ?? ($data['company_name'] . ' 마스터'),
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password'] ?? $this->DEFAULT_PASSWORD),
                'mobile' => $data['mobile'] ?? null,
                'authority' => 'normal_user',
                'agree_privacy' => true,
                'agree_terms' => true,
                'agree_sms' => true,
                'agree_email' => true,
                'agreed_at' => now(),
                'status' => 'active',
            ]);

            $this->membershipService->assignDefaultTier($masterUser);

            DB::commit();

            return $customer;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create Customer failed', [
                'user_id' => $adminUser->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function generateUniqueCustomerAccessCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Customer::where('access_code', $code)->exists());

        return $code;
    }

    public function checkAccessCode(array $data, User $user): array
    {
        try {
            DB::beginTransaction();

            $existingUser = Customer::query()
                ->where('access_code', $data['access_code'])
                ->first();

            $isDuplicate = $existingUser !== null;

            return [
                'is_duplicate' => $isDuplicate,
            ];
        } catch (\Exception $e) {
            Log::error('Check Access Code failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function uploadLogo(array $data, User $user, string|int $id): AdminCustomerDetailResource
    {
        try {
            DB::beginTransaction();

            $customer = Customer::query()->findOrFail($id);

            $logoV3CommonPath = $this->processLogoUpload($data, $id, 'logo_v3_common');
            $logoV2Header = $this->processLogoUpload($data, $id, 'logo_v2_header');
            $logoV2Login = $this->processLogoUpload($data, $id, 'logo_v2_login');

            $customer->update([
                'logo_v3_common' => $logoV3CommonPath ?? $customer->logo_v3_common,
                'logo_v2_header' => $logoV2Header ?? $customer->logo_v2_header,
                'logo_v2_login' => $logoV2Login ?? $customer->logo_v2_login,
            ]);

            DB::commit();

            return new AdminCustomerDetailResource($customer);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Upload Logo failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getApproveRequests(int $perPage, ?string $requestType = null): LengthAwarePaginator
    {
        try {
            $query = Customer::query()
                ->with(['user'])
                ->where(['approval_status' => ApprovalStatus::PENDING->value])
                ->orderBy('created_at', 'desc');

            if ($requestType) {
                $query->where('approval_request_type', $requestType);
            }

            return $query->paginate($perPage);
        } catch (\Exception $e) {
            Log::error('Get Approve Requests failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getApprovalHistories(int $perPage, ?string $requestType = null, ?string $approvalStatus = null): LengthAwarePaginator
    {
        try {
            $query = Customer::query()
                ->with(['user', 'approvedBy', 'rejectedBy'])
                ->whereIn('approval_status', [ApprovalStatus::ACCEPTED->value, ApprovalStatus::REJECTED->value])
                ->orderByRaw("
                    CASE
                        WHEN approval_status = 'accepted' THEN approved_at
                        WHEN approval_status = 'rejected' THEN rejected_at
                        ELSE NULL
                    END DESC
                ");

            if ($requestType) {
                $query->where('approval_request_type', $requestType);
            }

            if ($approvalStatus) {
                $query->where('approval_status', $approvalStatus);
            }

            return $query->paginate($perPage);
        } catch (\Exception $e) {
            Log::error('Get Approve Requests failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function approval(array $data, User $user)
    {
        try {
            DB::beginTransaction();

            $customers = Customer::query()
                ->whereIn('id', $data['customer_ids'])
                ->where('approval_status', ApprovalStatus::PENDING->value)
                ->get();

            if ($customers->isEmpty()) {
                throw new \Exception('승인 대기 중인 고객사를 찾을 수 없습니다.');
            }

            if ($customers->count() !== count($data['customer_ids'])) {
                throw new \Exception('일부 고객사가 승인 대기 상태가 아닙니다.');
            }

            foreach ($customers as $customer) {
                $customer->update([
                    'approval_status' => ApprovalStatus::from($data['approval_status']),
                    'approved_by' => $data['approval_status'] === ApprovalStatus::ACCEPTED->value ? $user->id : null,
                    'approved_at' => $data['approval_status'] === ApprovalStatus::ACCEPTED->value ? now() : null,
                    'rejected_by' => $data['approval_status'] === ApprovalStatus::REJECTED->value ? $user->id : null,
                    'rejected_at' => $data['approval_status'] === ApprovalStatus::REJECTED->value ? now() : null,
                    'rejected_reason' => $data['approval_status'] === ApprovalStatus::REJECTED->value ? ($data['reason'] ?? null) : null,
                ]);
            }

            DB::commit();
        } catch (\Exception $e) {
            Log::error('Check Access Code failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get approval status options
     */
    private function getApprovalStatusOptions(): array
    {
        return [
            ['value' => ApprovalStatus::ACCEPTED->value, 'label' => 'Accept'],
            ['value' => ApprovalStatus::REJECTED->value, 'label' => 'Reject'],
            ['value' => ApprovalStatus::PENDING->value, 'label' => 'Pending'],
        ];
    }

    /**
     * Get status options for customers
     */
    private function getStatusOptions(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => ucfirst($case->value),
        ], CustomerStatus::cases());
    }

    /**
     * Get main menu options (Primary menu) for customer registration
     * 주요메뉴 옵션
     */
    private function getMainMenuOptions(): array
    {
        $menus = CustomerOrderMenu::cases();

        return array_map(function ($menu) {
            return [
                'value' => $menu->value,
                'label' => $menu->label(),
                'label_en' => $menu->labelEn(),
            ];
        }, $menus);
    }

    /**
     * Get branch in charge options (Assigned branch) for customer registration
     * 담당지점 옵션
     */
    private function getBranchInChargeOptions(): array
    {
        return Code::query()
            ->select('id', 'code', 'name')
            ->orderBy('name')
            ->get()
            ->map(function ($code) {
                return [
                    'value' => $code->code,
                    'label' => $code->name ?? $code->code,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Update customer
     * 고객사 수정
     */
    public function updateCustomer(int $id, array $data, User $adminUser): Customer
    {
        try {
            DB::beginTransaction();

            $customer = Customer::findOrFail($id);

            $masterUser = $customer->user;
            if ($masterUser) {
                $userUpdates = [];
                if (array_key_exists('name', $data)) $userUpdates['name'] = $data['name'];
                if (array_key_exists('email', $data)) $userUpdates['email'] = $data['email'];
                if (array_key_exists('mobile', $data)) $userUpdates['mobile'] = $data['mobile'];
                if (array_key_exists('username', $data) && $data['username']) $userUpdates['username'] = $data['username'];
                if (array_key_exists('password', $data) && $data['password']) $userUpdates['password'] = Hash::make($data['password']);
                if (!empty($userUpdates)) $masterUser->update($userUpdates);
            }

            $customer->update([
                'company_name' => Arr::get($data, 'company_name', $customer->company_name),
                'business_registration_number' => Arr::get($data, 'business_registration_number', $customer->business_registration_number),
                'business_registration_file' => Arr::get($data, 'business_registration_file', $customer->business_registration_file),
                'representative_name' => Arr::get($data, 'representative_name', $customer->representative_name),
                'contact_name' => Arr::get($data, 'name', $customer->contact_name),
                'contact_phone' => Arr::get($data, 'contact_phone', $customer->contact_phone),
                'contact_mobile' => Arr::get($data, 'mobile', $customer->contact_mobile),
                'contact_email' => Arr::get($data, 'contact_email', $customer->contact_email),
                'business_type' => Arr::get($data, 'business_type', $customer->business_type),
                'business_items' => Arr::get($data, 'business_items', $customer->business_items),
                'postcode' => Arr::get($data, 'business_postcode', $customer->postcode),
                'address' => Arr::get($data, 'business_address', $customer->address),
                'detailed_address' => Arr::get($data, 'business_detailed_address', $customer->detailed_address),
                'tax_invoice_email' => Arr::get($data, 'tax_invoice_email', $customer->tax_invoice_email),
                'homepage_url' => Arr::get($data, 'homepage_url', $customer->homepage_url),
            ]);

            DB::commit();

            return $customer->fresh(['code', 'approvedBy', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update Customer failed', [
                'customer_id' => $id,
                'user_id' => $adminUser->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    protected function storeImage(UploadedFile $file, int $customerId, string $fileName): string
    {
        $directory = "customers/{$customerId}/logos";
        $fullFilename = $fileName . '.' . $file->getClientOriginalExtension();

        return $file->storeAs($directory, $fullFilename, 'public');
    }

    /**
     * Get promotional products for a customer
     * 고객사 홍보 제품 목록 조회
     */
    public function getPromotionalProducts(int $customerId, array $filters = []): array
    {
        try {
            $customer = Customer::findOrFail($customerId);

            // Get all products with their promotional status for this customer
            $query = Product::query()
                ->with(['category'])
                ->where('is_active', true);

            // Search filter
            if (! empty($filters['search'])) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('name_en', 'like', "%{$search}%")
                        ->orWhere('name_ja', 'like', "%{$search}%");
                });
            }

            // Category filter
            if (! empty($filters['category_id'])) {
                $query->where('category_id', $filters['category_id']);
            }

            // Pagination
            $perPage = (int) ($filters['per_page'] ?? 20);
            $currentPage = (int) ($filters['current_page'] ?? $filters['page'] ?? 1);

            $paginator = $query->orderBy('name')->paginate($perPage, ['*'], 'page', $currentPage);
            $products = $paginator->getCollection();

            // Get promotional product IDs for this customer
            $promotionalProductIds = CustomerPromotionalProduct::where('customer_id', $customerId)
                ->orderBy('sort_order')
                ->pluck('product_id')
                ->toArray();

            // Get sort orders for promoted products
            $sortOrders = CustomerPromotionalProduct::where('customer_id', $customerId)
                ->whereIn('product_id', $promotionalProductIds)
                ->pluck('sort_order', 'product_id')
                ->toArray();

            // Map products with promotional status
            $result = $products->map(function ($product) use ($promotionalProductIds, $sortOrders) {
                $isPromoted = in_array($product->id, $promotionalProductIds);
                $sortOrder = $isPromoted ? ($sortOrders[$product->id] ?? 0) : null;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                    ] : null,
                    'pricing_profile_id' => $product->pricing_profile_id,
                    'is_promoted' => $isPromoted,
                    'sort_order' => $sortOrder,
                ];
            })->toArray();

            return [
                'products' => $result,
                'promotional_product_ids' => $promotionalProductIds,
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total_page' => $paginator->lastPage(),
                    'total_item' => $paginator->total(),
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Get Promotional Products failed', [
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update promotional products for a customer
     * 고객사 홍보 제품 설정 업데이트
     */
    public function updatePromotionalProducts(int $customerId, array $productIds, User $user): array
    {
        try {
            DB::beginTransaction();

            $customer = Customer::findOrFail($customerId);

            // Remove all existing promotional products for this customer
            CustomerPromotionalProduct::where('customer_id', $customerId)->delete();

            // Add new promotional products
            $sortOrder = 0;
            foreach ($productIds as $productId) {
                // Verify product exists and is active
                $product = Product::where('id', $productId)
                    ->where('is_active', true)
                    ->first();

                if ($product) {
                    CustomerPromotionalProduct::create([
                        'customer_id' => $customerId,
                        'product_id' => $productId,
                        'sort_order' => $sortOrder++,
                    ]);
                }
            }

            DB::commit();

            // Return updated list
            return $this->getPromotionalProducts($customerId);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update Promotional Products failed', [
                'customer_id' => $customerId,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get customer payment information
     * 고객사 결제 정보 조회
     */
    public function getPaymentInformation(int $id): array
    {
        $customer = Customer::findOrFail($id);

        return [
            'postpaid_payment_enabled' => $customer->postpaid_payment_enabled,
            'prepaid_payment_enabled' => $customer->prepaid_payment_enabled,
            'prepaid_payment_methods' => $customer->prepaid_payment_methods ?? [],
            'shipping_fee_applied' => $customer->shipping_fee_applied,
            'shipping_method' => $customer->shipping_method,
            'shipping_fee' => $customer->shipping_fee,
            'shipping_fee_type' => $customer->shipping_fee_type,
            'free_shipping_min_order_amount' => $customer->free_shipping_min_order_amount,
        ];
    }

    /**
     * Get customer bookkeeping (ledger) data
     * 고객사 장부 조회
     */
    public function getBookkeeping(int $id, array $filters = []): array
    {
        $customer = Customer::with('users', 'code')->findOrFail($id);

        $userIds = $customer->users->pluck('id')->toArray();

        $limits = UserLimit::query()
            ->with('user')
            ->whereIn('user_id', $userIds)
            ->get();

        $totalLimit = $limits->sum('limit');
        $totalUsage = $limits->sum('usage_amount');
        $totalRemaining = $limits->sum('remaining_amount');

        $members = $limits->map(function ($limit) {
            $user = $limit->user;
            return [
                'user_id' => $user?->id,
                'name' => $user?->name,
                'username' => $user?->username,
                'contact_phone' => $user?->phone,
                'contact_email' => $user?->email,
                'headquarters' => $user?->headquarters,
                'business_office' => $user?->business_office,
                'team' => $user?->team,
                'position' => $user?->position,
                'limit' => $limit->limit,
                'usage_amount' => $limit->usage_amount,
                'remaining_amount' => $limit->remaining_amount,
                'status' => $limit->status,
            ];
        })->values()->toArray();

        // Flat paginated transactions sorted by created_at desc
        $perPage = (int) ($filters['per_page'] ?? 20);
        $page = (int) ($filters['page'] ?? 1);
        $limitIds = $limits->pluck('id')->toArray();

        $transactionQuery = LimitUsagedLogs::query()
            ->whereIn('user_limit_id', $limitIds)
            ->when(!empty($filters['date_from']), fn($q) => $q->where('created_at', '>=', $filters['date_from']))
            ->when(!empty($filters['date_to']), fn($q) => $q->where('created_at', '<=', $filters['date_to'] . ' 23:59:59'))
            ->orderBy('created_at', 'desc');

        $paginator = $transactionQuery->paginate($perPage, ['*'], 'page', $page);

        $transactions = collect($paginator->items())->map(function ($log) {
            return [
                'id' => $log->id,
                'date' => $log->created_at?->format('Y-m-d'),
                'description' => $log->description,
                'usage_amount' => $log->usage_amount,
                'remaining_amount' => $log->remaining_amount,
                'quantity' => $log->quantity,
                'notes' => $log->notes,
                'transaction_person' => $log->transaction_person,
                'reference_type' => $log->reference_type,
                'reference_id' => $log->reference_id,
            ];
        })->values()->toArray();

        return [
            'summary' => [
                'company_name' => $customer->company_name,
                'contact_name' => $customer->contact_name,
                'contact_phone' => $customer->contact_phone,
                'affiliation' => $customer->code?->name,
                'total_limit' => $totalLimit,
                'total_usage' => $totalUsage,
                'total_remaining' => $totalRemaining,
            ],
            'members' => $members,
            'transactions' => $transactions,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total_page' => $paginator->lastPage(),
                'total_item' => $paginator->total(),
            ],
        ];
    }

    /**
     * Get audit logs for a customer (edit history).
     */
    public function getAuditLogs(int $id, array $filters = []): array
    {
        Customer::findOrFail($id);

        $perPage = (int) ($filters['per_page'] ?? 20);
        $page = (int) ($filters['page'] ?? 1);

        $activities = Activity::where('subject_type', Customer::class)
            ->where('subject_id', $id)
            ->orderByDesc('created_at')
            ->get();

        $logs = [];
        foreach ($activities as $activity) {
            $properties = $activity->properties ?? collect();
            $old = (array) ($properties['old'] ?? []);
            $new = (array) ($properties['attributes'] ?? []);

            if ($activity->event === 'created') {
                $logs[] = [
                    'action' => 'created',
                    'field' => null,
                    'old_value' => null,
                    'new_value' => null,
                    'changed_by' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'changed_at' => $activity->created_at,
                ];
                continue;
            }

            $changedKeys = array_unique(array_merge(array_keys($old), array_keys($new)));

            foreach ($changedKeys as $field) {
                $oldVal = $old[$field] ?? null;
                $newVal = $new[$field] ?? null;

                if ($oldVal === $newVal) {
                    continue;
                }

                $logs[] = [
                    'action' => $activity->event,
                    'field' => $field,
                    'old_value' => $oldVal,
                    'new_value' => $newVal,
                    'changed_by' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'changed_at' => $activity->created_at,
                ];
            }
        }

        $total = count($logs);
        $offset = ($page - 1) * $perPage;
        $pagedLogs = array_slice($logs, $offset, $perPage);

        return [
            'data' => ['audit_logs' => $pagedLogs],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_page' => (int) ceil($total / $perPage) ?: 1,
                'total_item' => $total,
            ],
        ];
    }

    /**
     * Get all customers as minimal list (no pagination) for dropdowns.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllCustomersMinimal(): array
    {
        return Customer::query()
            ->select(['id', 'company_name', 'access_code'])
            ->orderBy('company_name')
            ->orderBy('id')
            ->get()
            ->map(static fn (Customer $c): array => [
                'id' => (int) $c->id,
                'company_name' => $c->company_name,
                'access_code' => $c->access_code,
            ])
            ->values()
            ->all();
    }

    /**
     * Get single customer detail with member list.
     */
    public function getCustomerWithMembers(int|string $id): Customer
    {
        return Customer::query()
            ->with(['approvedBy', 'code', 'users'])
            ->findOrFail($id);
    }

    private function processLogoUpload(array $data, string|int $id, string $logoKey): ?string
    {
        if (! array_key_exists($logoKey, $data)) {
            return null;
        }

        $file = $data[$logoKey];

        if (! $file instanceof UploadedFile || ! $file->isFile()) {
            return null;
        }

        $fileName = $id . '_' . str_replace('logo_', '', $logoKey);

        return $this->storeImage($file, $id, $fileName);
    }
}
