<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Nurigo\Solapi\Api\MessageService;
use Nurigo\Solapi\Model\MessageRequest;
use Nurigo\Solapi\Model\MessageResponse;
use Nurigo\Solapi\Models\Message;
use Nurigo\Solapi\Services\SolapiMessageService;

class SmsService
{
    protected ?SolapiMessageService $messageService = null;

    protected function getMessageService(): SolapiMessageService
    {
        if ($this->messageService === null) {
            $apiKey = config('services.coolsms.api_key');
            $apiSecret = config('services.coolsms.api_secret');

            if (empty($apiKey) || empty($apiSecret)) {
                throw new \Exception('Coolsms credentials not configured. Please set COOLSMS_API_KEY and COOLSMS_API_SECRET in .env');
            }

            $this->messageService = new SolapiMessageService($apiKey, $apiSecret);
        }

        return $this->messageService;
    }

    public function send(string $to, string $message): bool
    {
        try {
            $to = $this->normalizePhoneNumber($to);

            if (! app()->environment('production')) {
                Log::info('SMS would be sent (non-production mode)', [
                    'to' => $to,
                    'message' => $message,
                    'environment' => app()->environment(),
                ]);

                return true;
            }

            $fromNumber = config('services.coolsms.sender_number');
            if (empty($fromNumber)) {
                throw new \Exception('Coolsms sender number not configured. Please set COOLSMS_SENDER_NUMBER in .env');
            }

            return $this->sendViaCoolsms($to, $fromNumber, $message);
        } catch (\Exception $e) {
            Log::error('SMS service error', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function sendViaCoolsms(string $to, string $from, string $text): bool
    {
        try {
            $client = $this->getMessageService();

            $message = new Message();

            $message->setTo($to);
            $message->setFrom($from);
            $message->setText($text);

            $response = $client->send($message);

            Log::info('SMS sent successfully', [
                'to' => $to,
                'from' => $from,
                'response' => $response,
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('SMS service error', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function sendVerificationCode(string $phoneNumber, string $code): bool
    {
        $message = "인증번호: {$code}\n유효기간: 10분";

        return $this->send($phoneNumber, $message);
    }

    protected function normalizePhoneNumber(string $phoneNumber): string
    {
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        if (! str_starts_with($cleaned, '+')) {
            if (str_starts_with($cleaned, '0')) {
                $cleaned = '+82' . substr($cleaned, 1);
            } else {
                $cleaned = '+82' . $cleaned;
            }
        }

        return $cleaned;
    }
}
