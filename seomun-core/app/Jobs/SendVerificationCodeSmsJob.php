<?php

namespace App\Jobs;

use App\Services\Popbill\PopbillSmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendVerificationCodeSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60; // Wait 60 seconds before retry

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $phoneNumber,
        public string $code
    ) {}

    /**
     * Execute the job.
     */
    public function handle(PopbillSmsService $smsService): void
    {
        try {
            $success = $smsService->sendVerificationCode($this->phoneNumber, $this->code);

            if (! $success) {
                Log::warning('SMS sending returned false', [
                    'phone_number' => $this->phoneNumber,
                    'code' => $this->code,
                ]);
                throw new \Exception('SMS sending failed');
            }

            Log::info('Verification code SMS sent successfully', [
                'phone_number' => $this->phoneNumber,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send verification code SMS', [
                'phone_number' => $this->phoneNumber,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendVerificationCodeSmsJob failed after all retries', [
            'phone_number' => $this->phoneNumber,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        // Optionally: Send notification to admin about failed SMS
        // Notification::route('slack', config('services.slack.notifications.channel'))
        //     ->notify(new FailedSmsNotification($this->phoneNumber, $exception));
    }
}
