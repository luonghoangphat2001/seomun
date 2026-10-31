<?php

namespace App\Services\Popbill;

use Illuminate\Validation\ValidationException;

class BankAccounts
{
    public function all(): array
    {
        return array_filter(config('popbill.accounts', []), fn (array $account) => ! empty($account['number']));
    }

    public function get(string $key): array
    {
        $account = $this->all()[$key] ?? null;
        if (! $account) {
            throw ValidationException::withMessages(['bank_account_key' => '사용 가능한 입금 계좌를 선택해 주세요.']);
        }

        return $account;
    }

    public function identity(string $key): string
    {
        $account = $this->get($key);

        return hash('sha256', implode(':', [
            config('popbill.test') ? 'test' : 'live', config('popbill.corp_num'),
            $account['bank_code'], $account['number'],
        ]));
    }

    public function instructions(string $key, string $reference): array
    {
        $account = $this->get($key);

        return [
            'bank_account_key' => $key,
            'bank_code' => $account['bank_code'],
            'bank_name' => $account['bank_name'],
            'account_number' => $account['number'],
            'account_holder' => $account['holder'],
            'transfer_reference' => $reference,
            'matching_rule' => 'depositor_name_v1',
            'transfer_reference_required' => false,
            'recipient_description_label' => '받는 분 통장 표시',
            'transfer_instructions' => '주문 시 입력한 입금자명과 받는 분 통장에 표시되는 이름이 정확히 일치해야 합니다. 주문금액을 정확히 입금해 주세요. 입금코드는 입력하지 않아도 됩니다.',
            'check_interval_minutes' => 5,
        ];
    }
}
