<?php

namespace App\Services\Popbill;

use App\Models\BankDeposit;
use App\Models\BankFeedSync;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class BankFeedPoller
{
    public function __construct(private EasyFinBankClient $client, private BankAccounts $accounts,
        private BankDepositMatcher $matcher) {}

    public function poll(string $key): void
    {
        $identity = $this->accounts->identity($key);
        $lock = Cache::lock('popbill:bank:'.$identity, 3600);
        if (! $lock->get()) {
            return;
        }
        try {
            $sync = BankFeedSync::firstOrCreate(['account_identity' => $identity], ['account_key' => $key]);
            $this->collect($sync, $key);
            BankDeposit::where('account_identity', $identity)->where('status', 'unmatched')
                ->chunkById(100, function ($deposits) {
                    foreach ($deposits as $deposit) {
                        $this->matcher->autoMatch($deposit);
                    }
                });
        } finally {
            $lock->release();
        }
    }

    private function collect(BankFeedSync $sync, string $key): void
    {
        try {
            // A POPBiLL JobID expires after one hour. Repeat its original range on expiry.
            if ($sync->job_id && $sync->requested_at->lte(now()->subMinutes(55))) {
                $sync->update(['job_id' => null]);
            }
            if (! $sync->job_id) {
                if ($sync->requested_at?->gt(now()->subMinutes(5))) {
                    return;
                }
                $today = CarbonImmutable::now('Asia/Seoul')->startOfDay();
                $start = $sync->completed_through
                    ? CarbonImmutable::parse($sync->completed_through->format('Y-m-d'), 'Asia/Seoul')->subDay()
                    : $today->subDay();
                // Never silently skip an outage beyond the provider's retention period.
                if ($start->lt($today->subMonthsNoOverflow(3))) {
                    throw new RuntimeException('Bank feed is outside POPBiLL retention; manual recovery required.');
                }
                $end = $start->addDays(7)->min($today);
                $job = $this->client->requestJob($this->accounts->get($key), $start->format('Ymd'), $end->format('Ymd'));
                $sync->update(['job_id' => $job, 'requested_at' => now(),
                    'start_date' => $start->toDateString(), 'end_date' => $end->toDateString()]);
            }
            $state = $this->client->jobState($sync->job_id);
            if (! isset($state->jobState) || ! in_array((int) $state->jobState, [0, 1, 2, 3], true)) {
                throw new RuntimeException('Invalid POPBiLL collection state.');
            }
            if ((int) $state->jobState !== 3) {
                return;
            }
            if ((int) ($state->errorCode ?? 0) !== 1) {
                $sync->update(['job_id' => null]);
                throw new RuntimeException('POPBiLL collection failed.', (int) ($state->errorCode ?? 0));
            }
            $page = 1;
            do {
                $result = $this->client->search($sync->job_id, $page);
                if ((int) ($result->code ?? 0) !== 1 || ! isset($result->list, $result->pageCount)
                    || ! is_array($result->list)) {
                    throw new RuntimeException('Invalid POPBiLL transaction page.');
                }
                foreach ($result->list as $row) {
                    $this->import($sync, $row);
                }
                $page++;
            } while ($page <= (int) $result->pageCount);
            $sync->update(['completed_through' => $sync->end_date, 'job_id' => null,
                'last_success_at' => now(), 'last_error_at' => null, 'last_error_code' => null]);
        } catch (\Throwable $e) {
            $sync->update(['last_error_at' => now(), 'last_error_code' => (int) $e->getCode()]);
            throw $e;
        }
    }

    private function import(BankFeedSync $sync, object $row): void
    {
        $amount = (string) ($row->accIn ?? '');
        if (! preg_match('/^\d{1,13}(?:\.0{1,2})?$/D', $amount)) {
            throw new RuntimeException('Invalid KRW deposit amount.');
        }
        if ((int) $amount === 0) {
            return;
        }
        if (empty($row->tid) || strlen($row->tid) > 32 || ! preg_match('/^\d{14}$/D', $row->trdt ?? '')) {
            throw new RuntimeException('Invalid POPBiLL transaction identity or date.');
        }
        $time = CarbonImmutable::createFromFormat('!YmdHis', $row->trdt, 'Asia/Seoul');
        if ($time->format('YmdHis') !== $row->trdt) {
            throw new RuntimeException('Invalid POPBiLL transaction date.');
        }
        BankDeposit::firstOrCreate([
            'account_identity' => $sync->account_identity, 'provider_tid' => $row->tid,
        ], [
            'account_key' => $sync->account_key, 'amount' => $amount,
            'deposited_at' => $time->setTimezone(config('app.timezone')),
            'remarks' => [(string) ($row->remark1 ?? ''), (string) ($row->remark2 ?? ''), (string) ($row->remark3 ?? '')],
        ]);
    }
}
