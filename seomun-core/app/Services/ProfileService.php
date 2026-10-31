<?php

namespace App\Services;

use App\Enums\UserAuthority;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ProfileService
{
    /**
     * Format user data for API response
     */
    public function formatUserData(User $user, bool $includeAgreedAt = false): array
    {
        $authorityEnum = $user->getAuthorityEnum();

        $data = [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'mobile' => $user->mobile,
            'postcode' => $user->postcode,
            'address' => $user->address,
            'detailed_address' => $user->detailed_address,
            'authority' => $user->authority,
            'role' => $user->authority, // Alias for authority (for FE convenience)
            'is_admin' => $authorityEnum?->isAdmin() ?? false,
            'is_super_admin' => $authorityEnum?->isSuperAdmin() ?? false,
            'is_store_admin' => $user->isStoreAdmin(),
            'is_normal_user' => $authorityEnum === UserAuthority::USER,

            // Organization Information (조직 정보)
            'headquarters' => $user->headquarters,
            'business_office' => $user->business_office,
            'team' => $user->team,
            'position' => $user->position,

            // Permissions and Approval Information (권한 및 결재정보)
            'permission' => match ($authorityEnum) {
                UserAuthority::SUPER_ADMIN => '슈퍼 관리자',
                UserAuthority::STORE_ADMIN => '매장 관리자',
                UserAuthority::USER => '일반회원',
                default => $user->authority ?? '일반회원',
            },
            'individual_approval' => $user->individual_approval ?? false,
            'approval_line' => $user->approval_line ?? [],

            // Agreements
            'agree_sms' => (bool) ($user->agree_sms ?? false),
            'agree_email' => (bool) ($user->agree_email ?? false),

            // Member type
            'member_type' => $user->member_type,

            'registration_path' => $user->registration_path,
        ];

        // Business (Customer) Information
        if ($user->member_type === 'business' && $user->customer) {
            $customer = $user->customer;
            $data['customer'] = [
                'company_name' => $customer->company_name,
                'business_registration_number' => $customer->business_registration_number,
                'representative_name' => $customer->representative_name,
                'contact_name' => $customer->contact_name,
                'contact_phone' => $customer->contact_phone,
                'contact_email' => $customer->contact_email,
                'business_type' => $customer->business_type,
                'business_items' => $customer->business_items,
                'industry_type' => $customer->industry_type,
                'postcode' => $customer->postcode,
                'address' => $customer->address,
                'detailed_address' => $customer->detailed_address,
                'tax_invoice_email' => $customer->tax_invoice_email,
                'homepage_url' => $customer->homepage_url,
                'business_registration_file' => $customer->business_registration_file,
            ];
        }

        if ($includeAgreedAt) {
            $data['agreed_at'] = $user->agreed_at;
        }

        return $data;
    }

    /**
     * Update user profile
     *
     * @throws \Exception
     */
    public function updateProfile(User $user, array $data): User
    {
        try {
            // Prepare update data
            $updateData = [];

            // Basic Information (기본 정보)
            if (isset($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (isset($data['email'])) {
                $updateData['email'] = $data['email'];
            }
            if (isset($data['phone'])) {
                $updateData['phone'] = $data['phone'];
            }
            if (isset($data['mobile'])) {
                $updateData['mobile'] = $data['mobile'];
            }

            // Address Information (주소 정보)
            if (isset($data['postcode'])) {
                $updateData['postcode'] = $data['postcode'];
            }
            if (isset($data['address'])) {
                $updateData['address'] = $data['address'];
            }
            if (isset($data['detailed_address'])) {
                $updateData['detailed_address'] = $data['detailed_address'];
            }

            // Organization Information (조직 정보)
            if (isset($data['headquarters'])) {
                $updateData['headquarters'] = $data['headquarters'];
            }
            if (isset($data['business_office'])) {
                $updateData['business_office'] = $data['business_office'];
            }
            if (isset($data['team'])) {
                $updateData['team'] = $data['team'];
            }
            if (isset($data['position'])) {
                $updateData['position'] = $data['position'];
            }

            // Agreements (수신동의)
            if (isset($data['agree_sms'])) {
                $updateData['agree_sms'] = $data['agree_sms'];
            }
            if (isset($data['agree_email'])) {
                $updateData['agree_email'] = $data['agree_email'];
            }

            // Update user
            $user->update($updateData);

            // Business (Customer) Information — only for business members
            if ($user->member_type === 'business' && $user->customer_id) {
                $customerData = [];

                $customerFields = [
                    'company_name',
                    'business_registration_number',
                    'representative_name',
                    'contact_name',
                    'contact_phone',
                    'contact_email',
                    'business_type',
                    'business_items',
                    'industry_type',
                    'tax_invoice_email',
                    'homepage_url',
                    'business_registration_file',
                ];
                foreach ($customerFields as $field) {
                    if (isset($data[$field])) {
                        $customerData[$field] = $data[$field];
                    }
                }

                // Business address fields (mapped with prefix)
                if (isset($data['business_postcode'])) {
                    $customerData['postcode'] = $data['business_postcode'];
                }
                if (isset($data['business_address'])) {
                    $customerData['address'] = $data['business_address'];
                }
                if (isset($data['business_detailed_address'])) {
                    $customerData['detailed_address'] = $data['business_detailed_address'];
                }

                if (! empty($customerData)) {
                    Customer::where('id', $user->customer_id)->update($customerData);
                }
            }

            // Refresh user to get latest data
            return $user->fresh();
        } catch (\Exception $e) {
            Log::error('Profile update failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update user password
     *
     * @throws \Exception
     */
    public function updatePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        try {
            // Verify current password
            if (! Hash::check($currentPassword, $user->password)) {
                throw new \Exception('현재 비밀번호가 일치하지 않습니다.');
            }

            // Check if new password is different from current password
            if (Hash::check($newPassword, $user->password)) {
                throw new \Exception('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
            }

            // Update password
            $user->update([
                'password' => Hash::make($newPassword),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Password update failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
