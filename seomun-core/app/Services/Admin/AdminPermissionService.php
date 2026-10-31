<?php

namespace App\Services\Admin;

use App\Enums\UsageStatusValue;
use App\Enums\UserStatus;
use App\Http\Resources\Admin\AdminPermissionResource;
use App\Models\AdminPermission;
use App\Models\User;
use App\Models\UserAdminPermission;
use App\Services\PaginationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class AdminPermissionService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get menu structure for settings permissions.
     * Returns hierarchical menu structure with available actions.
     * Existing menu_permissions (e.g. from a permission by id) are used to set checked state.
     * If branchId is provided, returns only that branch (one 1st menu group or one second menu).
     *
     * @param  array<int, mixed>|null  $existingPermissions  Stored menu_permissions for the permission (e.g. [['menu' => 'member_list', 'actions' => ['view','register']]])
     * @param  string|null  $branchId  Optional menu id (e.g. member_management, member_list) to return only that branch
     * @return array<int, mixed>
     */
    public function getMenuStructure(?array $existingPermissions = null, ?string $branchId = null): array
    {

        // Helper function to check if a menu is checked
        $isMenuChecked = function (string $menuId) use ($existingPermissions): bool {
            if (! $existingPermissions || ! is_array($existingPermissions)) {
                return false;
            }
            foreach ($existingPermissions as $perm) {
                if (isset($perm['menu']) && $perm['menu'] === $menuId) {
                    return true;
                }
            }

            return false;
        };

        // Helper function to format label with en, ko and ja
        $formatLabel = function (string $value, string $en, string $ko, string $ja = ''): array {
            return [
                'value' => $value,
                'label' => [
                    'en' => $en,
                    'ko' => $ko,
                    'ja' => $ja,
                ],
            ];
        };

        $full = [
            [
                'id' => 'dashboard',
                'key' => 'dashboard',
                'name' => $formatLabel('dashboard', 'Dashboard/Statistics', '대시보드/통계', 'ダッシュボード/統計'),
                'menus' => [
                    [
                        'id' => 'dashboard_operations',
                        'key' => 'dashboard_operations',
                        'name' => $formatLabel('dashboard_operations', 'Operations Dashboard', '운영 대시보드', '運用ダッシュボード'),
                        'description' => $formatLabel('dashboard_operations', 'View operations dashboard', '운영 대시보드 조회', '運用ダッシュボードを表示'),
                        'checked' => $isMenuChecked('dashboard_operations'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'dashboard_statistics',
                        'key' => 'dashboard_statistics',
                        'name' => $formatLabel('dashboard_statistics', 'Statistical Management', '통계 관리', '統計管理'),
                        'description' => $formatLabel('dashboard_statistics', 'View statistical management', '통계 관리 조회', '統計管理を表示'),
                        'checked' => $isMenuChecked('dashboard_statistics'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'administrators',
                'key' => 'administrators',
                'name' => $formatLabel('administrators', 'Administrator Management', '관리자 관리', '管理者管理'),
                'menus' => [
                    [
                        'id' => 'administrators_list',
                        'key' => 'administrators_list',
                        'name' => $formatLabel('administrators_list', 'List of administrator accounts', '관리자 계정 목록', '管理者アカウント一覧'),
                        'description' => $formatLabel('administrators_list', 'View list of administrator accounts', '관리자 계정 목록 조회', '管理者アカウント一覧を表示'),
                        'checked' => $isMenuChecked('administrators_list'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'administrators_create',
                        'key' => 'administrators_create',
                        'name' => $formatLabel('administrators_create', 'Administrator Registration', '관리자 등록', '管理者登録'),
                        'description' => $formatLabel('administrators_create', 'Create and register new administrators', '신규 관리자 생성 및 등록', '新規管理者を登録'),
                        'checked' => $isMenuChecked('administrators_create'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'outsourcing',
                'key' => 'outsourcing',
                'name' => $formatLabel('outsourcing', 'Outsourcing Management', '외주 관리', '外注管理'),
                'menus' => [
                    [
                        'id' => 'outsourcing_list',
                        'key' => 'outsourcing_list',
                        'name' => $formatLabel('outsourcing_list', 'Outsourcing Account List', '외주 계정 목록', '外注アカウント一覧'),
                        'description' => $formatLabel('outsourcing_list', 'View list of outsourcing accounts', '외주 계정 목록 조회', '外注アカウント一覧を表示'),
                        'checked' => $isMenuChecked('outsourcing_list'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'outsourcing_create',
                        'key' => 'outsourcing_create',
                        'name' => $formatLabel('outsourcing_create', 'Outsourcing company registration', '외주 업체 등록', '外注会社登録'),
                        'description' => $formatLabel('outsourcing_create', 'Register new outsourcing company', '신규 외주 업체 등록', '新規外注会社を登録'),
                        'checked' => $isMenuChecked('outsourcing_create'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'customers',
                'key' => 'customers',
                'name' => $formatLabel('customers', 'Customer Management', '고객사 관리', '顧客管理'),
                'menus' => [
                    [
                        'id' => 'customers_list',
                        'key' => 'customers_list',
                        'name' => $formatLabel('customers_list', 'Customer List', '고객사 목록', '顧客一覧'),
                        'description' => $formatLabel('customers_list', 'View list of customers', '고객사 목록 조회', '顧客一覧を表示'),
                        'checked' => $isMenuChecked('customers_list'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'customers_create',
                        'key' => 'customers_create',
                        'name' => $formatLabel('customers_create', 'Customer Registration', '고객사 등록', '顧客登録'),
                        'description' => $formatLabel('customers_create', 'Create and register new customers', '신규 고객사 생성 및 등록', '新規顧客を登録'),
                        'checked' => $isMenuChecked('customers_create'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'customers_approvals',
                        'key' => 'customers_approvals',
                        'name' => $formatLabel('customers_approvals', 'Approval Management', '승인 관리', '承認管理'),
                        'description' => $formatLabel('customers_approvals', 'Manage customer approvals', '고객사 승인 관리', '顧客承認を管理'),
                        'checked' => $isMenuChecked('customers_approvals'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'customers_exposure',
                        'key' => 'customers_exposure',
                        'name' => $formatLabel('customers_exposure', 'Exposure management', '노출 관리', '公開管理'),
                        'description' => $formatLabel('customers_exposure', 'Control customer exposure settings', '고객사 노출 설정 관리', '顧客の公開設定を管理'),
                        'checked' => $isMenuChecked('customers_exposure'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'customers_membership_levels',
                        'key' => 'customers_membership_levels',
                        'name' => $formatLabel('customers_membership_levels', 'Membership Level Management', '회원 등급 관리', '会員ランク管理'),
                        'description' => $formatLabel('customers_membership_levels', 'Manage customer membership levels', '고객사 회원 등급 관리', '顧客の会員ランクを管理'),
                        'checked' => $isMenuChecked('customers_membership_levels'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'customers_points',
                        'key' => 'customers_points',
                        'name' => $formatLabel('customers_points', 'Point Management', '포인트 관리', 'ポイント管理'),
                        'description' => $formatLabel('customers_points', 'Manage customer points', '고객사 포인트 관리', '顧客のポイントを管理'),
                        'checked' => $isMenuChecked('customers_points'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'orders',
                'key' => 'orders',
                'name' => $formatLabel('orders', 'Order Management', '주문 관리', '注文管理'),
                'menus' => [
                    [
                        'id' => 'orders_list',
                        'key' => 'orders_list',
                        'name' => $formatLabel('orders_list', 'Order List', '주문 목록', '注文一覧'),
                        'description' => $formatLabel('orders_list', 'View list of orders', '주문 목록 조회', '注文一覧を表示'),
                        'checked' => $isMenuChecked('orders_list'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'orders_production_tools',
                        'key' => 'orders_production_tools',
                        'name' => $formatLabel('orders_production_tools', 'Production tools', '제작 도구', '制作ツール'),
                        'description' => $formatLabel('orders_production_tools', 'Manage production tools', '제작 도구 관리', '制作ツールを管理'),
                        'checked' => $isMenuChecked('orders_production_tools'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'orders_equipment',
                        'key' => 'orders_equipment',
                        'name' => $formatLabel('orders_equipment', 'Equipment Management', '장비 관리', '設備管理'),
                        'description' => $formatLabel('orders_equipment', 'Manage equipment', '장비 관리', '設備を管理'),
                        'checked' => $isMenuChecked('orders_equipment'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'orders_processing',
                        'key' => 'orders_processing',
                        'name' => $formatLabel('orders_processing', 'Order processing', '주문 처리', '注文処理'),
                        'description' => $formatLabel('orders_processing', 'Process and manage orders', '주문 처리 및 관리', '注文を処理・管理'),
                        'checked' => $isMenuChecked('orders_processing'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'orders_tax_invoices',
                        'key' => 'orders_tax_invoices',
                        'name' => $formatLabel('orders_tax_invoices', 'Tax invoice', '세금계산서', '税金計算書'),
                        'description' => $formatLabel('orders_tax_invoices', 'Manage tax invoices', '세금계산서 관리', '税金計算書を管理'),
                        'checked' => $isMenuChecked('orders_tax_invoices'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'orders_cash_receipts',
                        'key' => 'orders_cash_receipts',
                        'name' => $formatLabel('orders_cash_receipts', 'Cash receipt', '현금영수증', '現金領収書'),
                        'description' => $formatLabel('orders_cash_receipts', 'Manage cash receipts', '현금영수증 관리', '現金領収書を管理'),
                        'checked' => $isMenuChecked('orders_cash_receipts'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'products',
                'key' => 'products',
                'name' => $formatLabel('products', 'Product/Template Management', '상품/템플릿 관리', '商品/テンプレート管理'),
                'menus' => [
                    [
                        'id' => 'products_products',
                        'key' => 'products_products',
                        'name' => $formatLabel('products_products', 'Product Management', '상품 관리', '商品管理'),
                        'description' => $formatLabel('products_products', 'Manage products', '상품 관리', '商品を管理'),
                        'checked' => $isMenuChecked('products_products'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'products_templates',
                        'key' => 'products_templates',
                        'name' => $formatLabel('products_templates', 'Template Management', '템플릿 관리', 'テンプレート管理'),
                        'description' => $formatLabel('products_templates', 'Manage templates', '템플릿 관리', 'テンプレートを管理'),
                        'checked' => $isMenuChecked('products_templates'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'products_options',
                        'key' => 'products_options',
                        'name' => $formatLabel('products_options', 'Option Management', '옵션 관리', 'オプション管理'),
                        'description' => $formatLabel('products_options', 'Manage product options', '상품 옵션 관리', '商品オプションを管理'),
                        'checked' => $isMenuChecked('products_options'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'products_price_simulation',
                        'key' => 'products_price_simulation',
                        'name' => $formatLabel('products_price_simulation', 'Price Simulation', '가격 시뮬레이션', '価格シミュレーション'),
                        'description' => $formatLabel('products_price_simulation', 'Simulate product pricing', '상품 가격 시뮬레이션', '商品価格をシミュレーション'),
                        'checked' => $isMenuChecked('products_price_simulation'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'products_price_history',
                        'key' => 'products_price_history',
                        'name' => $formatLabel('products_price_history', 'Unit Price Change History', '단가 변경 이력', '単価変更履歴'),
                        'description' => $formatLabel('products_price_history', 'View unit price change history', '단가 변경 이력 조회', '単価変更履歴を表示'),
                        'checked' => $isMenuChecked('products_price_history'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'products_shopping_settings',
                        'key' => 'products_shopping_settings',
                        'name' => $formatLabel('products_shopping_settings', 'Shopping Settings', '쇼핑 설정', 'ショッピング設定'),
                        'description' => $formatLabel('products_shopping_settings', 'Manage shopping settings', '쇼핑 설정 관리', 'ショッピング設定を管理'),
                        'checked' => $isMenuChecked('products_shopping_settings'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'products_unit_price_settings',
                        'key' => 'products_unit_price_settings',
                        'name' => $formatLabel('products_unit_price_settings', 'Unit Price Settings', '단가 설정', '単価設定'),
                        'description' => $formatLabel('products_unit_price_settings', 'Manage unit price settings', '단가 설정 관리', '単価設定を管理'),
                        'checked' => $isMenuChecked('products_unit_price_settings'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'categories',
                'key' => 'categories',
                'name' => $formatLabel('categories', 'Category Management', '카테고리 관리', 'カテゴリ管理'),
                'menus' => [
                    [
                        'id' => 'categories_list',
                        'key' => 'categories_list',
                        'name' => $formatLabel('categories_list', 'Category List', '카테고리 목록', 'カテゴリ一覧'),
                        'description' => $formatLabel('categories_list', 'View list of categories', '카테고리 목록 조회', 'カテゴリ一覧を表示'),
                        'checked' => $isMenuChecked('categories_list'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'categories_create',
                        'key' => 'categories_create',
                        'name' => $formatLabel('categories_create', 'Category Registration', '카테고리 등록', 'カテゴリ登録'),
                        'description' => $formatLabel('categories_create', 'Create and register new categories', '신규 카테고리 등록', '新規カテゴリを登録'),
                        'checked' => $isMenuChecked('categories_create'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'payments',
                'key' => 'payments',
                'name' => $formatLabel('payments', 'Payment/Settlement Management', '결제/정산 관리', '決済/精算管理'),
                'menus' => [
                    [
                        'id' => 'payments_details',
                        'key' => 'payments_details',
                        'name' => $formatLabel('payments_details', 'Payment history', '결제 내역', '決済履歴'),
                        'description' => $formatLabel('payments_details', 'View payment history', '결제 내역 조회', '決済履歴を表示'),
                        'checked' => $isMenuChecked('payments_details'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'payments_limits',
                        'key' => 'payments_limits',
                        'name' => $formatLabel('payments_limits', 'Post-payment/Limit Management', '후불/한도 관리', '後払い/限度管理'),
                        'description' => $formatLabel('payments_limits', 'Manage post-payment and limits', '후불 결제 및 한도 관리', '後払い・限度を管理'),
                        'checked' => $isMenuChecked('payments_limits'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'payments_settlement_report',
                        'key' => 'payments_settlement_report',
                        'name' => $formatLabel('payments_settlement_report', 'Settlement Report', '정산 보고서', '精算レポート'),
                        'description' => $formatLabel('payments_settlement_report', 'View settlement reports', '정산 보고서 조회', '精算レポートを表示'),
                        'checked' => $isMenuChecked('payments_settlement_report'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'delivery',
                'key' => 'delivery',
                'name' => $formatLabel('delivery', 'Delivery Management', '배송 관리', '配送管理'),
                'menus' => [
                    [
                        'id' => 'delivery_shipments',
                        'key' => 'delivery_shipments',
                        'name' => $formatLabel('delivery_shipments', 'Shipment Management', '출고 관리', '出荷管理'),
                        'description' => $formatLabel('delivery_shipments', 'Manage shipments', '출고 관리', '出荷を管理'),
                        'checked' => $isMenuChecked('delivery_shipments'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'delivery_tracking',
                        'key' => 'delivery_tracking',
                        'name' => $formatLabel('delivery_tracking', 'Delivery Tracking', '배송 추적', '配送追跡'),
                        'description' => $formatLabel('delivery_tracking', 'Track deliveries', '배송 추적', '配送を追跡'),
                        'checked' => $isMenuChecked('delivery_tracking'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'permissions',
                'key' => 'permissions',
                'name' => $formatLabel('permissions', 'Permission Management', '권한 관리', '権限管理'),
                'menus' => [
                    [
                        'id' => 'permissions',
                        'key' => 'permissions',
                        'name' => $formatLabel('permissions', 'Permission Management', '권한 관리', '権限管理'),
                        'description' => $formatLabel('permissions', 'Manage admin permissions', '관리자 권한 관리', '管理者権限を管理'),
                        'checked' => $isMenuChecked('permissions'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'notifications',
                'key' => 'notifications',
                'name' => $formatLabel('notifications', 'Notification Management', '알림 관리', '通知管理'),
                'menus' => [
                    [
                        'id' => 'notifications_templates',
                        'key' => 'notifications_templates',
                        'name' => $formatLabel('notifications_templates', 'Notification Template', '알림 템플릿', '通知テンプレート'),
                        'description' => $formatLabel('notifications_templates', 'Manage notification templates', '알림 템플릿 관리', '通知テンプレートを管理'),
                        'checked' => $isMenuChecked('notifications_templates'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'notifications_history',
                        'key' => 'notifications_history',
                        'name' => $formatLabel('notifications_history', 'Notification Sending History', '알림 발송 이력', '通知送信履歴'),
                        'description' => $formatLabel('notifications_history', 'View notification sending history', '알림 발송 이력 조회', '通知送信履歴を表示'),
                        'checked' => $isMenuChecked('notifications_history'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'system-content',
                'key' => 'system-content',
                'name' => $formatLabel('system-content', 'System Basic Management', '시스템 기본 관리', 'システム基本管理'),
                'menus' => [
                    [
                        'id' => 'system_content_company_settings',
                        'key' => 'system_content_company_settings',
                        'name' => $formatLabel('system_content_company_settings', 'Company Information Settings', '회사 정보 설정', '会社情報設定'),
                        'description' => $formatLabel('system_content_company_settings', 'Manage company information used on documents', '문서에 표시되는 회사 정보 관리', '書類に表示する会社情報を管理'),
                        'checked' => $isMenuChecked('system_content_company_settings'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                        ],
                    ],
                    [
                        'id' => 'system_content_notices',
                        'key' => 'system_content_notices',
                        'name' => $formatLabel('system_content_notices', 'Notice Management', '공지사항 관리', 'お知らせ管理'),
                        'description' => $formatLabel('system_content_notices', 'Manage notices', '공지사항 관리', 'お知らせを管理'),
                        'checked' => $isMenuChecked('system_content_notices'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'system_content_banners',
                        'key' => 'system_content_banners',
                        'name' => $formatLabel('system_content_banners', 'Banner Management', '배너 관리', 'バナー管理'),
                        'description' => $formatLabel('system_content_banners', 'Manage banners', '배너 관리', 'バナーを管理'),
                        'checked' => $isMenuChecked('system_content_banners'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'system_content_popups',
                        'key' => 'system_content_popups',
                        'name' => $formatLabel('system_content_popups', 'Popup Management', '팝업 관리', 'ポップアップ管理'),
                        'description' => $formatLabel('system_content_popups', 'Manage popups', '팝업 관리', 'ポップアップを管理'),
                        'checked' => $isMenuChecked('system_content_popups'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'system_content_faqs',
                        'key' => 'system_content_faqs',
                        'name' => $formatLabel('system_content_faqs', 'FAQ Management', 'FAQ 관리', 'FAQ管理'),
                        'description' => $formatLabel('system_content_faqs', 'Manage FAQs', 'FAQ 관리', 'FAQを管理'),
                        'checked' => $isMenuChecked('system_content_faqs'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'system_content_guides',
                        'key' => 'system_content_guides',
                        'name' => $formatLabel('system_content_guides', 'Guide Content Management', '가이드 콘텐츠 관리', 'ガイドコンテンツ管理'),
                        'description' => $formatLabel('system_content_guides', 'Manage guide content', '가이드 콘텐츠 관리', 'ガイドコンテンツを管理'),
                        'checked' => $isMenuChecked('system_content_guides'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'system_content_images',
                        'key' => 'system_content_images',
                        'name' => $formatLabel('system_content_images', 'Manage uploaded images', '업로드 이미지 관리', 'アップロード画像管理'),
                        'description' => $formatLabel('system_content_images', 'Manage uploaded images', '업로드 이미지 관리', 'アップロード画像を管理'),
                        'checked' => $isMenuChecked('system_content_images'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'inquiries',
                'key' => 'inquiries',
                'name' => $formatLabel('inquiries', 'Inquiry Management', '문의 관리', 'お問い合わせ管理'),
                'menus' => [
                    [
                        'id' => 'inquiries',
                        'key' => 'inquiries',
                        'name' => $formatLabel('inquiries', 'Inquiry Management', '문의 관리', 'お問い合わせ管理'),
                        'description' => $formatLabel('inquiries', 'Manage customer inquiries', '고객 문의 관리', 'お客様のお問い合わせを管理'),
                        'checked' => $isMenuChecked('inquiries'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
            [
                'id' => 'system-logs',
                'key' => 'system-logs',
                'name' => $formatLabel('system-logs', 'System Log Management', '시스템 로그 관리', 'システムログ管理'),
                'menus' => [
                    [
                        'id' => 'system_logs_access',
                        'key' => 'system_logs_access',
                        'name' => $formatLabel('system_logs_access', 'Connection logs', '접속 로그', '接続ログ'),
                        'description' => $formatLabel('system_logs_access', 'View connection logs', '접속 로그 조회', '接続ログを表示'),
                        'checked' => $isMenuChecked('system_logs_access'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                    [
                        'id' => 'system_logs_tasks',
                        'key' => 'system_logs_tasks',
                        'name' => $formatLabel('system_logs_tasks', 'Job Log', '작업 로그', 'ジョブログ'),
                        'description' => $formatLabel('system_logs_tasks', 'View job logs', '작업 로그 조회', 'ジョブログを表示'),
                        'checked' => $isMenuChecked('system_logs_tasks'),
                        'actions' => [
                            $formatLabel('view', 'View', '조회', '表示'),
                            $formatLabel('register', 'Register', '등록', '登録'),
                            $formatLabel('edit', 'Edit', '수정', '編集'),
                            $formatLabel('delete', 'Delete', '삭제', '削除'),
                            $formatLabel('approval', 'Approval', '승인', '承認'),
                        ],
                    ],
                ],
            ],
        ];

        if ($branchId === null || $branchId === '') {
            return $full;
        }

        $branchId = (string) $branchId;
        foreach ($full as $group) {
            if (isset($group['id']) && $group['id'] === $branchId) {
                return [$group];
            }
            if (! empty($group['menus']) && is_array($group['menus'])) {
                foreach ($group['menus'] as $menu) {
                    if (isset($menu['id']) && $menu['id'] === $branchId) {
                        return [[
                            'id' => $group['id'],
                            'name' => $group['name'],
                            'menus' => [$menu],
                        ]];
                    }
                }
            }
        }

        return [];
    }

    /**
     * Get search filter options for admin permissions.
     *
     * @return array<string, mixed>
     */
    public function getSearchFilters(): array
    {
        // Get distinct authority names (permission names)
        $authorityNames = AdminPermission::query()
            ->whereNotNull('name')
            ->distinct()
            ->orderBy('name')
            ->pluck('name')
            ->map(fn ($name) => [
                'value' => $name,
                'label' => $name,
            ])
            ->values()
            ->toArray();

        return [
            'usage_status_options' => UsageStatusValue::options(),
            'authority_name_options' => $authorityNames,
            // Note: registrant is input search (not dropdown) - users can search by name, username, or email
        ];
    }

    /**
     * Build base query for admin permissions with optional filters.
     * This method is reused by listing and Excel export.
     *
     * @param  array<string, mixed>  $filters
     */
    protected function buildQuery(array $filters): Builder
    {
        $query = AdminPermission::query()->with('createdBy');

        $search = Arr::get($filters, 'search');
        $usageStatus = Arr::get($filters, 'usage_status');

        if ($search !== null && $search !== '') {
            $searchTerm = '%'.$search.'%';
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                    ->orWhereHas('createdBy', function (Builder $builder) use ($searchTerm) {
                        $builder->where('username', 'like', $searchTerm)
                            ->orWhere('name', 'like', $searchTerm)
                            ->orWhere('email', 'like', $searchTerm);
                    });
            });
        }

        if ($usageStatus) {
            $query->where('usage_status', $usageStatus);
        }

        $sortBy = Arr::get($filters, 'sort_by', 'created_at');
        $sortOrder = Arr::get($filters, 'sort_order', 'desc');

        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }

    /**
     * Get admin permissions with filters for Super Admin.
     *
     * @param  array<string, mixed>  $filters  Optional filters:
     *                                         - search: string (searches authority name and registrant username/name/email)
     *                                         - usage_status: string (active, inactive)
     *                                         - sort_by: string (name, created_at, usage_status) - default: created_at
     *                                         - sort_order: string (asc, desc) - default: desc
     * @param  int  $perPage  Number of items per page (default: 20, max: 100)
     */
    public function getPermissions(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters);

        // Ensure per_page doesn't exceed maximum
        $perPage = min($perPage, 100);

        $currentPage = Arr::get($filters, 'current_page', 1);

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    public function getPermission(int $id): AdminPermission
    {
        return AdminPermission::with('createdBy')->findOrFail($id);
    }

    /**
     * Create a new admin permission.
     *
     * @param  array<string, mixed>  $data
     */
    public function createPermission(User $adminUser, array $data): AdminPermission
    {
        return DB::transaction(function () use ($adminUser, $data) {
            return AdminPermission::create([
                'name' => $data['name'],
                'code' => $data['code'] ?? null,
                'description' => $data['description'] ?? null,
                'usage_status' => $data['usage_status'],
                'menu_permissions' => $data['menu_permissions'] ?? null,
                'created_by' => $adminUser->id,
            ]);
        });
    }

    /**
     * Update an existing admin permission.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePermission(int $id, array $data): AdminPermission
    {
        return DB::transaction(function () use ($id, $data) {
            $permission = AdminPermission::findOrFail($id);

            $permission->update([
                'name' => $data['name'],
                'code' => $data['code'] ?? $permission->code,
                'description' => $data['description'] ?? null,
                'usage_status' => $data['usage_status'],
                'menu_permissions' => $data['menu_permissions'] ?? null,
            ]);

            return $permission;
        });
    }

    /**
     * Update menu permissions (settings) for an existing admin permission.
     * This is a specialized method for updating only menu_permissions.
     *
     * @param  int  $id  Permission ID
     * @param  array<string, mixed>  $data  Should contain 'menu_permissions' array
     */
    public function updateMenuPermissions(int $id, array $data): AdminPermission
    {
        return DB::transaction(function () use ($id, $data) {
            $permission = AdminPermission::findOrFail($id);

            // Transform menu_permissions format if needed
            // Expected format: [['menu_id' => 'member_list', 'actions' => ['view', 'register']], ...]
            $menuPermissions = $data['menu_permissions'] ?? [];

            $permission->update([
                'menu_permissions' => $menuPermissions,
            ]);

            return $permission->fresh();
        });
    }

    public function deletePermission(int $id): void
    {
        DB::transaction(function () use ($id) {
            $permission = AdminPermission::findOrFail($id);
            // if permission has user active  cannot delete
            if ($permission->userPermissions()->whereHas('user', function ($query) {
                $query->where('status', UserStatus::ACTIVE->value);
            })->exists()) {
                throw new \Exception('활성 사용자가 연결된 권한은 삭제할 수 없습니다.');
            }
            $permission->delete();
        });
    }

    /**
     * Copy an existing permission to a new one.
     *
     * @param  array<string, mixed>  $data
     */
    public function copyPermission(int $id, User $adminUser, array $data): AdminPermission
    {
        $source = AdminPermission::findOrFail($id);

        return DB::transaction(function () use ($source, $adminUser, $data) {
            return AdminPermission::create([
                'name' => $data['name'],
                'description' => $source->description,
                'usage_status' => $data['usage_status'] ?? $source->usage_status,
                'menu_permissions' => $source->menu_permissions,
                'created_by' => $adminUser->id,
            ]);
        });
    }

    /**
     * Format list response with pagination and resources.
     *
     * @return array<string, mixed>
     */
    public function formatListResponse(LengthAwarePaginator $paginator): array
    {
        return [
            'permissions' => AdminPermissionResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }

    /**
     * Get users assigned to a specific permission with pagination.
     *
     * @param  int  $permissionId
     * @param  array<string, mixed>  $filters
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function getUsersByPermission(int $permissionId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $permission = AdminPermission::findOrFail($permissionId);

        $query = UserAdminPermission::query()
            ->where('admin_permission_id', $permissionId)
            ->with('user')
            ->join('users', 'user_admin_permissions.user_id', '=', 'users.id');

        $keyword = $filters['keyword'] ?? null;
        if ($keyword) {
            $searchTerm = '%'.$keyword.'%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('users.username', 'like', $searchTerm)
                    ->orWhere('users.name', 'like', $searchTerm)
                    ->orWhere('users.email', 'like', $searchTerm);
            });
        }

        $query->select('user_admin_permissions.*');

        $perPage = max(1, min($perPage, 100));
        $currentPage = $filters['current_page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }

    /**
     * Add users to a permission.
     *
     * @param  int  $permissionId
     * @param  array<int>  $userIds
     * @param  User  $adminUser
     * @return array{added: array, skipped: array}
     */
    public function addUsersToPermission(int $permissionId, array $userIds, User $adminUser): array
    {
        $permission = AdminPermission::findOrFail($permissionId);

        return DB::transaction(function () use ($permissionId, $userIds, $adminUser) {
            $added = [];
            $skipped = [];

            foreach ($userIds as $userId) {
                $existing = UserAdminPermission::where('admin_permission_id', $permissionId)
                    ->where('user_id', $userId)
                    ->first();

                if ($existing) {
                    $skipped[] = $userId;
                    continue;
                }

                UserAdminPermission::create([
                    'user_id' => $userId,
                    'admin_permission_id' => $permissionId,
                    'status' => 'active',
                    'grant_date' => now(),
                    'created_by' => $adminUser->id,
                ]);

                $added[] = $userId;
            }

            return ['added' => $added, 'skipped' => $skipped];
        });
    }

    /**
     * Remove users from a permission.
     *
     * @param  int  $permissionId
     * @param  array<int>  $userIds
     * @param  User  $adminUser
     * @return int Number of removed records
     */
    public function removeUsersFromPermission(int $permissionId, array $userIds, User $adminUser): int
    {
        $permission = AdminPermission::findOrFail($permissionId);

        return DB::transaction(function () use ($permissionId, $userIds, $adminUser) {
            return UserAdminPermission::where('admin_permission_id', $permissionId)
                ->whereIn('user_id', $userIds)
                ->delete();
        });
    }

    /**
     * Get users NOT assigned to a specific permission with pagination.
     *
     * @param  int  $permissionId
     * @param  array<string, mixed>  $filters
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function getAvailableUsersByPermission(int $permissionId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        AdminPermission::findOrFail($permissionId);

        $query = User::query();

        $keyword = $filters['keyword'] ?? null;
        if ($keyword) {
            $searchTerm = '%'.$keyword.'%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('username', 'like', $searchTerm)
                    ->orWhere('name', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm);
            });
        }

        $query->whereDoesntHave('adminPermissions', function ($q) use ($permissionId) {
            $q->where('admin_permission_id', $permissionId);
        });

        $perPage = max(1, min($perPage, 100));
        $currentPage = $filters['current_page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $currentPage);
    }
}
