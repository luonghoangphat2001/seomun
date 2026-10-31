<?php

namespace App\Console\Commands;

use App\Services\PointTransactionService;
use Illuminate\Console\Command;

class ExpirePoints extends Command
{
    protected $signature = 'points:expire {--chunk=100 : Number of records to process per chunk}';

    protected $description = 'Expire expired point balances daily at 00:01';

    public function __construct(
        protected PointTransactionService $pointTransactionService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $chunkSize = (int) $this->option('chunk');

        $this->info('Starting point expiration process...');

        $totalExpired = $this->pointTransactionService->expire($chunkSize);

        $this->info("Point expiration completed. Total expired: {$totalExpired}");

        return Command::SUCCESS;
    }
}
