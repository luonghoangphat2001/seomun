<?php

namespace App\Services\Popbill;

use Linkhub\Popbill\PopbillEasyFinBank;
use RuntimeException;

class EasyFinBankClient
{
    private ?PopbillEasyFinBank $sdk = null;

    protected function sdk(): PopbillEasyFinBank
    {
        if (! config('popbill.enabled')) {
            throw new RuntimeException('POPBiLL bank integration is disabled.');
        }
        if (app()->environment('production') && config('popbill.test')) {
            throw new RuntimeException('POPBiLL sandbox cannot confirm production payments.');
        }
        foreach (['link_id', 'secret_key', 'corp_num'] as $key) {
            if (! config('popbill.'.$key)) {
                throw new RuntimeException('Missing POPBiLL configuration: '.$key);
            }
        }
        if ($this->sdk === null) {
            if (! defined('LINKHUB_COMM_MODE')) {
                define('LINKHUB_COMM_MODE', 'CURL');
            }
            $this->sdk = new PopbillEasyFinBank(config('popbill.link_id'), config('popbill.secret_key'));
            $this->sdk->IsTest((bool) config('popbill.test'));
        }

        return $this->sdk;
    }

    public function requestJob(array $account, string $start, string $end): string
    {
        return $this->sdk()->RequestJob(config('popbill.corp_num'), $account['bank_code'],
            $account['number'], $start, $end, config('popbill.user_id'));
    }

    public function jobState(string $jobId): object
    {
        return $this->sdk()->GetJobState(config('popbill.corp_num'), $jobId, config('popbill.user_id'));
    }

    public function search(string $jobId, int $page): object
    {
        return $this->sdk()->Search(config('popbill.corp_num'), $jobId, ['I'], null,
            $page, 1000, 'A', config('popbill.user_id'));
    }
}
