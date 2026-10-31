<?php

namespace Database\Seeders;

use App\Models\RefundHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

class RefundAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'username' => 'newuser01',
                'refund_bank' => 'IBK',
                'refund_account_number' => '00106796097680',
                'refund_account_name' => '홍길동',
            ],
            [
                'username' => 'storeadmin',
                'refund_bank' => 'KB',
                'refund_account_number' => '12345678901234',
                'refund_account_name' => '김철수',
            ],
        ];

        foreach ($accounts as $account) {
            $user = User::where('username', $account['username'])->first();
            if (! $user) {
                continue;
            }

            $user->update([
                'refund_bank' => $account['refund_bank'],
                'refund_account_number' => $account['refund_account_number'],
                'refund_account_name' => $account['refund_account_name'],
            ]);

            // Seed refund histories for this user
            $statuses = ['completed', 'completed', 'pending'];
            foreach ($statuses as $i => $status) {
                $settlementDate = now()->subDays(($i + 1) * 7);

                RefundHistory::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'settlement_date' => $settlementDate->toDateString(),
                    ],
                    [
                        'refund_amount' => ($i + 1) * 10000,
                        'account_holder' => $account['refund_account_name'],
                        'bank_code' => $account['refund_bank'],
                        'account_number' => $account['refund_account_number'],
                        'deposit_date' => $status === 'completed' ? $settlementDate->addDays(3)->toDateString() : null,
                        'status' => $status,
                        'note' => null,
                    ]
                );
            }
        }

        $this->command->info('Refund account seeder completed.');
        $this->command->info('  - normaluser  -> IBK 00106796097680');
        $this->command->info('  - storeadmin  -> KB  12345678901234');
    }
}
