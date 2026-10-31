<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\ApprovalStatus;
use App\Enums\UserAuthority;
use App\Enums\UserRegistrationPath;
use App\Enums\UserStatus;
use App\Http\Filters\Admin\UserFilter;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class User extends Authenticatable
{
    use Filterable, HasApiTokens, HasFactory, LogsActivity, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'status',
        'approval_status',
        'username',
        'name',
        'email',
        'password',
        'phone',
        'mobile',
        'postcode',
        'address',
        'detailed_address',
        'authority',
        'headquarters',
        'business_office',
        'team',
        'position',
        'hire_date',
        'resignation_date',
        'department',
        'bank_name',
        'account_number',
        'agree_privacy',
        'agree_terms',
        'agree_sms',
        'agree_email',
        'agreed_at',
        'approved_at',
        'approved_by',
        'individual_approval',
        'approval_line',
        'last_login_at',
        'last_login_ip',
        'membership_tier_id',
        'registration_path',
        'member_type',
        'refund_bank',
        'refund_account_number',
        'refund_account_name',
        'note',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'agree_privacy' => 'boolean',
            'agree_terms' => 'boolean',
            'agree_sms' => 'boolean',
            'agree_email' => 'boolean',
            'agreed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'status' => UserStatus::class,
            'approval_status' => ApprovalStatus::class,
            'approved_at' => 'datetime',
            'individual_approval' => 'boolean',
            'approval_line' => 'array',
            'metadata' => 'array',
            'registration_path' => UserRegistrationPath::class,
            'hire_date' => 'date',
            'resignation_date' => 'date',
        ];
    }

    protected function getFiltersClass(): string
    {
        return UserFilter::class;
    }

    /**
     * Get the virtual accounts for the user.
     */
    public function virtualAccounts(): HasMany
    {
        return $this->hasMany(VirtualAccount::class);
    }

    public function virtualAccount(): HasOne
    {
        return $this->hasOne(VirtualAccount::class)->latestOfMany();
    }

    /**
     * Get the virtual account deposits for the user.
     */
    public function virtualAccountDeposits(): HasMany
    {
        return $this->hasMany(VirtualAccountDeposit::class);
    }

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'username'; // Use username instead of email for authentication
    }

    /**
     * Get the address books for the user.
     */
    public function addressBooks(): HasMany
    {
        return $this->hasMany(AddressBook::class);
    }

    public function savedProductOptions(): HasMany
    {
        return $this->hasMany(SavedProductOption::class);
    }

    /**
     * Get the refund histories for the user.
     */
    public function refundHistories(): HasMany
    {
        return $this->hasMany(RefundHistory::class);
    }

    /**
     * Get the refresh tokens for the user.
     */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    /**
     * Get the orders for the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the current loyalty-point balance for the user.
     */
    public function pointBalance(): HasOne
    {
        return $this->hasOne(PointBalance::class);
    }

    /**
     * Get the wallet for the user.
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Get the admin user who approved this member.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get approvals requested by this user.
     */
    public function requestedApprovals(): HasMany
    {
        return $this->hasMany(Approval::class, 'requested_by');
    }

    /**
     * Get approval items where this user is the approver.
     */
    public function approvalItems(): HasMany
    {
        return $this->hasMany(ApprovalItem::class, 'approver_id');
    }

    /**
     * Get admin permissions assigned to this user.
     */
    public function adminPermissions(): HasMany
    {
        return $this->hasMany(UserAdminPermission::class);
    }

    public function permissions(): HasManyThrough
    {
        return $this->hasManyThrough(
            AdminPermission::class,
            UserAdminPermission::class,
            'user_id',
            'id',
            'id',
            'admin_permission_id'
        );
    }

    public function getAllMenuPermissions(): array
    {
        $rawPermissions = $this->permissions()
            ->where('usage_status', 'ACTIVE')
            ->pluck('menu_permissions')
            ->toArray();

        return $this->mergeMenuPermissions($rawPermissions);
    }

    private function mergeMenuPermissions(array $permissionArrays): array
    {
        $merged = [];

        foreach ($permissionArrays as $permissionList) {
            if (is_string($permissionList)) {
                $permissionList = json_decode($permissionList, true) ?? [];
            }

            if (! is_array($permissionList)) {
                continue;
            }

            foreach ($permissionList as $item) {
                $menu = $item['menu'] ?? null;
                $actions = $item['actions'] ?? [];

                if (! $menu) {
                    continue;
                }

                if (! isset($merged[$menu])) {
                    $merged[$menu] = [];
                }

                $merged[$menu] = array_values(array_unique(array_merge($merged[$menu], $actions)));
            }
        }

        $result = [];
        foreach ($merged as $menu => $actions) {
            $result[] = [
                'menu' => $menu,
                'actions' => $actions,
            ];
        }

        return $result;
    }

    /**
     * Get recently viewed products for this user.
     */
    public function recentlyViewedProducts(): HasMany
    {
        return $this->hasMany(RecentlyViewedProduct::class);
    }

    /**
     * Get coupons owned by this user.
     */
    public function coupons(): HasMany
    {
        return $this->hasMany(UserCoupon::class);
    }

    /**
     * Get reviews written by this user.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get company name from related customer.
     */
    public function getCompanyNameAttribute(): ?string
    {
        return $this->customer?->company_name;
    }

    public function membershipTier(): BelongsTo
    {
        return $this->belongsTo(MembershipTier::class, 'membership_tier_id');
    }

    public function userCoupons(): HasMany
    {
        return $this->hasMany(UserCoupon::class);
    }

    // public function coupons(): BelongsToMany
    // {
    //     return $this->belongsToMany(Coupon::class, 'user_coupons')
    //         ->withPivot(['received_at', 'used_at', 'order_id', 'status'])
    //         ->withTimestamps();
    // }

    /**
     * Get authority enum
     */
    public function getAuthorityEnum(): ?UserAuthority
    {
        $authority = $this->authority;

        if ($authority instanceof UserAuthority) {
            return $authority;
        }

        return is_string($authority) ? UserAuthority::tryFromString($authority) : null;
    }

    /**
     * get limit postpaid
     *
     * @return HasOne<UserLimit, User>
     */
    public function limit(): HasOne
    {
        return $this->hasOne(UserLimit::class, 'user_id', 'id');
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        $enum = $this->getAuthorityEnum();

        return $enum?->isSuperAdmin() ?? false;
    }

    /**
     * Check if user is store admin
     */
    public function isStoreAdmin(): bool
    {
        return $this->authority === UserAuthority::STORE_ADMIN->value;
    }

    /**
     * Check if user is any admin type
     */
    public function isAdmin(): bool
    {
        $enum = $this->getAuthorityEnum();

        return $enum?->isAdmin() ?? false;
    }

    /**
     * Check if user is normal user
     */
    public function isUser(): bool
    {
        $enum = $this->getAuthorityEnum();

        return $enum === UserAuthority::USER;
    }

    public function isActive(): bool
    {
        return $this->status?->isActive() ?? false;
    }

    /**
     * Check user approved
     */
    public function isApproved(): bool
    {
        return $this->approval_status === ApprovalStatus::ACCEPTED->value;
    }

    protected static function booted()
    {
        /**
         * Default active status when creating
         */
        static::creating(function ($user) {
            $user->status ??= UserStatus::ACTIVE;
        });
    }

    /**
     * Configure activity log options for User model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'email',
                'phone',
                'mobile',
                'postcode',
                'address',
                'detailed_address',
                'status',
                'approval_status',
                'authority',
                'hire_date',
                'resignation_date',
                'department',
                'bank_name',
                'account_number',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Member has been {$eventName}");
    }
}
