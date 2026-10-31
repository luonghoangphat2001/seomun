<?php

namespace App\Console\Commands;

use App\Services\DeliveryTrackingPollingService;
use Illuminate\Console\Command;

class PollDeliveryTrackings extends Command
{
    protected $signature = 'delivery:trackings:poll
        {--limit=200 : Maximum number of trackings to dispatch in this run}
        {--force : Ignore per-tracking backoff and poll every active tracking}';

    protected $description = 'Smart-poll Hanjin for active delivery trackings and persist status changes';

    public function handle(DeliveryTrackingPollingService $service): int
    {
        $limit = $this->option('limit') !== null ? (int) $this->option('limit') : null;
        $force = (bool) $this->option('force');

        $dispatched = $service->dispatchPollBatch($limit, $force);

        $this->info("Dispatched {$dispatched} Hanjin tracking poll job(s).");

        return self::SUCCESS;
    }
}
