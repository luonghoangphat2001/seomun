<?php

namespace App\Console\Commands;

use App\Services\MembershipService;
use Illuminate\Console\Command;

class ProcessQuarterlyMembershipUpgrade extends Command
{
    protected $signature = 'membership:process-quarterly-upgrade';

    protected $description = 'Process quarterly membership tier upgrades and downgrades based on accumulated spending';

    public function __construct(
        protected MembershipService $membershipService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Processing quarterly membership upgrades...');

        $this->membershipService->processQuarterlyUpgrade();

        $this->info('Quarterly membership upgrade processing completed.');

        return Command::SUCCESS;
    }
}
