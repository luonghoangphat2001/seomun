<?php

namespace App\Services\Popbill;

use Illuminate\Support\Facades\Log;
use Linkhub\Popbill\PopbillMessaging;

class PopbillSmsService
{
    private ?PopbillMessaging $messageService = null;

    public function send(string $to, string $text): bool
    {
        try {
            if (! app()->environment('production')) {
                Log::info('SMS would be sent (non-production mode)', [
                    'to' => $to,
                    'message' => $text,
                    'environment' => app()->environment(),
                ]);

                return true;
            }

            if (! config('popbill.sms_enabled')) {
                throw new \RuntimeException('POPBiLL SMS integration is disabled.');
            }

            $from = config('popbill.sms_sender_number');
            if (empty($from)) {
                throw new \RuntimeException('POPBiLL SMS sender number is not configured.');
            }

            $receiptNumber = $this->messageService()->SendXMS(
                config('popbill.corp_num'),
                $from,
                null,
                $text,
                [['rcv' => $this->normalizePhoneNumber($to)]],
                null,
                false,
                config('popbill.user_id'),
            );

            Log::info('SMS sent successfully', [
                'to' => $to,
                'from' => $from,
            ]);

            return ! empty($receiptNumber);
        } catch (\Throwable $e) {
            Log::error('POPBiLL SMS service error', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function sendVerificationCode(string $phoneNumber, string $code): bool
    {
        return $this->send($phoneNumber, "인증번호: {$code}\n유효기간: 10분");
    }

    private function messageService(): PopbillMessaging
    {
        if ($this->messageService === null) {
            foreach (['link_id', 'secret_key', 'corp_num'] as $key) {
                if (empty(config('popbill.'.$key))) {
                    throw new \RuntimeException("POPBiLL {$key} is not configured.");
                }
            }

            if (! defined('LINKHUB_COMM_MODE')) {
                define('LINKHUB_COMM_MODE', 'CURL');
            }

            $this->messageService = new PopbillMessaging(
                config('popbill.link_id'),
                config('popbill.secret_key'),
            );
            $this->messageService->IsTest((bool) config('popbill.test'));
        }

        return $this->messageService;
    }

    private function normalizePhoneNumber(string $phoneNumber): string
    {
        $cleaned = preg_replace('/\D/', '', $phoneNumber);

        if (str_starts_with($cleaned, '82')) {
            $cleaned = '0'.substr($cleaned, 2);
        }

        return $cleaned;
    }
}
