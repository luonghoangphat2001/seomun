<?php

namespace App\Console\Commands;

use App\Models\ErpOption;
use App\Models\SizeOption;
use Illuminate\Console\Command;

class SyncSizeOptionErpId extends Command
{
    protected $signature = 'seed:sync-size-option-erp-id 
                            {--order-code= : Specific order code to process}
                            {--dry-run : Show what would be updated without making changes}';

    protected $description = 'Sync erp_option_id from erp_options.size_option_id to size_options.erp_option_id';

    public function handle(): int
    {
        $orderCode = $this->option('order-code');
        $dryRun = $this->option('dry-run');

        $this->info('Syncing erp_option_id from erp_options.size_option_id to size_options.erp_option_id...');

        // Get all ERP options that have size_option_id set (from LinkSizeOptionsToErpOptions command)
        $erpOptionsQuery = ErpOption::whereNotNull('size_option_id');

        $erpOptions = $erpOptionsQuery->get();

        if ($erpOptions->isEmpty()) {
            $this->warn('No erp_options found with size_option_id set!');
            $this->info("Run 'php artisan seed:link-size-options' first to link ERP options to size options.");

            return Command::FAILURE;
        }

        $updateCount = 0;
        $skipCount = 0;

        foreach ($erpOptions as $erpOption) {
            $sizeOptionId = $erpOption->size_option_id;
            $sizeOption = SizeOption::find($sizeOptionId);

            if (! $sizeOption) {
                $this->warn("Size option ID {$sizeOptionId} not found for ERP option: {$erpOption->label}");
                $skipCount++;

                continue;
            }

            // Check if order code matches (if specified)
            if ($orderCode && $sizeOption->order_code != $orderCode) {
                $skipCount++;

                continue;
            }

            // Check if update needed
            if ($sizeOption->erp_option_id == $erpOption->id) {
                $this->line("Skipped (already synced): {$erpOption->label} -> size_option {$sizeOption->name}");
                $skipCount++;

                continue;
            }

            if ($dryRun) {
                $this->info("Would update: SizeOption ID {$sizeOption->id} ({$sizeOption->name}) erp_option_id from {$sizeOption->erp_option_id} to {$erpOption->id}");
                $updateCount++;
            } else {
                $sizeOption->erp_option_id = $erpOption->id;
                $sizeOption->save();
                $this->info("Updated: SizeOption ID {$sizeOption->id} ({$sizeOption->name}) -> ERP option ID {$erpOption->id} ({$erpOption->label})");
                $updateCount++;
            }
        }

        $this->info("Done! Updated: {$updateCount}, Skipped: {$skipCount}");

        if ($dryRun) {
            $this->warn('This was a dry run. Run without --dry-run to apply changes.');
        }

        return Command::SUCCESS;
    }
}
