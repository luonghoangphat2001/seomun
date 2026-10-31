<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseController;
use App\Models\BankDeposit;
use App\Models\BankFeedSync;
use App\Services\Popbill\BankAccounts;
use App\Services\Popbill\BankDepositMatcher;
use App\Services\PaginationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminBankDepositController extends BaseController
{
    public function __construct(protected PaginationService $paginationService) {}

    public function index(Request $request, BankAccounts $accounts): JsonResponse
    {
        $input = $request->validate([
            'status' => ['sometimes', Rule::in(['unmatched', 'matched'])],
            'bank_account_key' => ['sometimes', Rule::in(['hana', 'im', 'woori'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $identities = array_map(fn ($key) => $accounts->identity($key), array_keys($accounts->all()));
        $query = BankDeposit::whereIn('account_identity', $identities);
        if (isset($input['status'])) {
            $query->where('status', $input['status']);
        }
        if (isset($input['bank_account_key'])) {
            $query->where('account_key', $input['bank_account_key']);
        }

        $deposits = $query->latest('deposited_at')->paginate($input['per_page'] ?? 25);

        return $this->responsePaginatedSuccess(200, '입금 내역이 성공적으로 조회되었습니다.', [
            'bank_deposits' => $deposits->items(),
        ], $this->paginationService->format($deposits));
    }

    public function syncStatus(BankAccounts $accounts): JsonResponse
    {
        $identities = array_map(fn ($key) => $accounts->identity($key), array_keys($accounts->all()));

        return response()->json(['success' => true, 'data' => BankFeedSync::whereIn('account_identity', $identities)->get()]);
    }

    public function confirm(Request $request, BankDeposit $deposit, BankDepositMatcher $matcher, BankAccounts $accounts): JsonResponse
    {
        $input = $request->validate([
            'payment_transaction_id' => ['required', 'integer', 'exists:payment_transactions,id'],
            'note' => ['required', 'string', 'max:1000'],
        ]);
        abort_unless($accounts->identity($deposit->account_key) === $deposit->account_identity, 404);

        return response()->json(['success' => true, 'data' => $matcher->confirm($deposit->id,
            $input['payment_transaction_id'], $request->user()->id, $input['note'])]);
    }
}
