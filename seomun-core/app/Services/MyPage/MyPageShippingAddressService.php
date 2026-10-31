<?php

namespace App\Services\MyPage;

use App\Http\Resources\AddressBookResource;
use App\Http\Resources\MyPageShippingAddressResource;
use App\Models\AddressBook;
use App\Models\Order;
use App\Models\User;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyPageShippingAddressService
{
    public function __construct(
        protected PaginationService $paginationService
    ) {}

    /**
     * Get paginated shipping addresses with filters
     */
    public function getAddresses(User $user, ?string $search = null, string $searchType = 'all', int $perPage = 15): array
    {
        try {
            $query = AddressBook::where('user_id', $user->id);

            if ($search) {
                $this->applySearchFilter($query, $search, $searchType);
            }

            // Newest first (same as order "배송지 변경" picker after 새 주소 추가).
            $addresses = $query->orderBy('created_at', 'desc')
                ->orderBy('id', 'desc')
                ->paginate($perPage);

            return [
                'addresses' => MyPageShippingAddressResource::collection($addresses->items()),
                'pagination' => $this->paginationService->format($addresses),
            ];
        } catch (\Exception $e) {
            Log::error('Get MyPage shipping addresses failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Get shipping address detail
     *
     * @throws ModelNotFoundException
     */
    public function getAddressDetail(User $user, int $id): MyPageShippingAddressResource
    {
        try {
            $address = AddressBook::where('user_id', $user->id)
                ->findOrFail($id);

            return new MyPageShippingAddressResource($address);
        } catch (\Exception $e) {
            Log::error('Get MyPage shipping address detail failed', [
                'user_id' => $user->id,
                'address_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Create shipping address
     */
    public function createAddress(User $user, array $data): MyPageShippingAddressResource
    {
        try {
            DB::beginTransaction();

            $data = $this->normalizeUiPayload($data);
            $data['user_id'] = $user->id;

            // Normalize phone and mobile numbers (remove hyphens)
            if (isset($data['phone'])) {
                $data['phone'] = preg_replace('/[^0-9]/', '', $data['phone']);
            }
            if (isset($data['mobile'])) {
                $data['mobile'] = preg_replace('/[^0-9]/', '', $data['mobile']);
            }

            // If this is set as default, unset other defaults for this user
            if (isset($data['is_default']) && $data['is_default']) {
                AddressBook::where('user_id', $user->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $address = AddressBook::create($data);

            DB::commit();

            return new MyPageShippingAddressResource($address);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create MyPage shipping address failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update shipping address
     *
     * @throws ModelNotFoundException
     */
    public function updateAddress(User $user, int $id, array $data): MyPageShippingAddressResource
    {
        try {
            DB::beginTransaction();

            $address = AddressBook::where('user_id', $user->id)
                ->findOrFail($id);

            $data = $this->normalizeUiPayload($data);

            // Normalize phone and mobile numbers (remove hyphens)
            if (isset($data['phone'])) {
                $data['phone'] = preg_replace('/[^0-9]/', '', $data['phone']);
            }
            if (isset($data['mobile'])) {
                $data['mobile'] = preg_replace('/[^0-9]/', '', $data['mobile']);
            }

            // If this is set as default, unset other defaults for this user
            if (isset($data['is_default']) && $data['is_default']) {
                AddressBook::where('user_id', $user->id)
                    ->where('id', '!=', $id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $address->update($data);

            DB::commit();

            return new MyPageShippingAddressResource($address->fresh());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update MyPage shipping address failed', [
                'user_id' => $user->id,
                'address_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Batch delete shipping addresses
     *
     * @return int Number of deleted records
     */
    public function batchDeleteAddresses(User $user, array $ids): int
    {
        try {
            return AddressBook::where('user_id', $user->id)
                ->whereIn('id', $ids)
                ->delete();
        } catch (\Exception $e) {
            Log::error('Delete MyPage shipping addresses failed', [
                'user_id' => $user->id,
                'ids' => $ids,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Set shipping address as default
     *
     * @throws ModelNotFoundException
     */
    public function setDefaultAddress(User $user, int $id): MyPageShippingAddressResource
    {
        try {
            DB::beginTransaction();

            $address = AddressBook::where('user_id', $user->id)
                ->findOrFail($id);

            // Unset all other defaults for this user
            AddressBook::where('user_id', $user->id)
                ->where('id', '!=', $id)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            // Set this one as default
            $address->update(['is_default' => true]);

            DB::commit();

            return new MyPageShippingAddressResource($address->fresh());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Set default shipping address failed', [
                'user_id' => $user->id,
                'address_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Paginated address book for "배송지 변경" modal: same filters as list, plus which row matches the order.
     *
     * @return array{selected_address_book_id: int|null, addresses: array<int, array<string, mixed>>, pagination: array<string, mixed>}
     */
    public function getAddressesForOrderPicker(User $user, Order $order, ?string $search = null, int $perPage = 15): array
    {
        $query = AddressBook::where('user_id', $user->id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('recipient', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('detailed_address', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Newest first so a row just added via "새 주소 추가" appears at the top (design note).
        $addresses = $query->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        $selectedId = $this->resolveSelectedAddressBookId($user, $order);

        $req = request();
        $rows = collect($addresses->items())->map(function (AddressBook $ab) use ($selectedId, $req) {
            return array_merge(
                (new AddressBookResource($ab))->toArray($req),
                ['is_selected' => $selectedId !== null && (int) $ab->id === (int) $selectedId]
            );
        })->values()->all();

        return [
            'selected_address_book_id' => $selectedId,
            'addresses' => $rows,
            'pagination' => $this->paginationService->format($addresses),
        ];
    }

    private function resolveSelectedAddressBookId(User $user, Order $order): ?int
    {
        $metaId = (int) data_get($order->metadata, 'shipping_address_book_id');
        if ($metaId > 0 && AddressBook::where('user_id', $user->id)->whereKey($metaId)->exists()) {
            return $metaId;
        }

        $candidates = AddressBook::where('user_id', $user->id)->orderBy('is_default', 'desc')->orderBy('id')->get();
        foreach ($candidates as $ab) {
            if ($this->addressBookMatchesOrderShipping($order, $ab)) {
                return (int) $ab->id;
            }
        }

        return null;
    }

    private function addressBookMatchesOrderShipping(Order $order, AddressBook $ab): bool
    {
        if (trim((string) $order->shipping_name) !== trim((string) $ab->recipient)) {
            return false;
        }
        if (trim((string) ($order->shipping_postcode ?? '')) !== trim((string) ($ab->postcode ?? ''))) {
            return false;
        }
        if (trim((string) ($order->shipping_address ?? '')) !== trim((string) ($ab->address ?? ''))) {
            return false;
        }
        if (trim((string) ($order->shipping_address_detail ?? '')) !== trim((string) ($ab->detailed_address ?? ''))) {
            return false;
        }

        $orderPhones = array_values(array_unique(array_filter([
            $this->digitsOnly($order->shipping_phone),
            $this->digitsOnly($order->shipping_phone2),
        ])));
        $addrPhones = array_values(array_unique(array_filter([
            $this->digitsOnly($ab->mobile),
            $this->digitsOnly($ab->phone),
        ])));

        if ($orderPhones === [] && $addrPhones === []) {
            return true;
        }
        if ($orderPhones === [] || $addrPhones === []) {
            return false;
        }

        foreach ($orderPhones as $op) {
            foreach ($addrPhones as $ap) {
                if ($op !== '' && $ap !== '' && $op === $ap) {
                    return true;
                }
            }
        }

        return false;
    }

    private function digitsOnly(?string $value): string
    {
        return preg_replace('/\D+/', '', (string) ($value ?? '')) ?? '';
    }

    private function normalizeUiPayload(array $data): array
    {
        unset($data['email'], $data['delivery_message']);

        if (array_key_exists('phone', $data)) {
            $data['mobile'] = null;
        } else {
            unset($data['mobile']);
        }

        return $data;
    }

    private function applySearchFilter(Builder $query, string $search, string $searchType): void
    {
        match ($searchType) {
            'all' => $query->where(function (Builder $q) use ($search) {
                $q->where('recipient', 'like', "%{$search}%")
                    ->orWhere('postcode', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('detailed_address', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            }),
            'address' => $query->where(function (Builder $q) use ($search) {
                $q->where('postcode', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('detailed_address', 'like', "%{$search}%");
            }),
            'phone' => $query->where(function (Builder $q) use ($search) {
                $q->where('phone', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            }),
            default => $query->where('recipient', 'like', "%{$search}%"),
        };
    }
}
