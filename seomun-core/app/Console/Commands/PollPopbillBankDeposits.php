<?php

namespace App\Console\Commands;

use App\Services\Popbill\BankAccounts;
use App\Services\Popbill\BankFeedPoller;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PollPopbillBankDeposits extends Command
{
    protected $signature = 'popbill:poll-bank-deposits';

    protected $description = 'Collect Woori/Hana/iM deposits and reconcile pending bank-transfer payments';

    public function handle(BankFeedPoller $poller, BankAccounts $accounts): int
    {
        if (! config('popbill.enabled')) {
            $this->info('POPBiLL bank integration is disabled.');

            return self::SUCCESS;
        }
        if ($accounts->all() === []) {
            $this->error('No POPBiLL bank accounts configured.');

            return self::FAILURE;
        }
        $result = self::SUCCESS;
        foreach (array_keys($accounts->all()) as $key) {
            try {
                $poller->poll($key);
            } catch (\Throwable $e) {
                // Provider errors may contain account information: log codes, not payloads.
                Log::error('POPBiLL bank collection failed', ['account' => $key,
                    'exception' => $e::class, 'code' => $e->getCode()]);
                $this->error('POPBiLL collection failed for '.$key.' (code '.$e->getCode().').');
                $result = self::FAILURE;
            }
        }

        return $result;
    }
}
