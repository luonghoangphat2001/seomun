<?php

namespace App\Console\Commands;

use App\Models\ErpOption;
use App\Models\ErpOptionGroup;
use App\Models\SizeOption;
use Illuminate\Console\Command;

class LinkSizeOptionsToErpOptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'seed:link-size-options 
                            {--order-code= : Specific order code to process}
                            {--group-code= : Specific option group code (default: OP910)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Link ERP options (especially OP910) to size options based on label matching';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $orderCode = $this->option('order-code');
        $groupCode = $this->option('group-code') ?? 'OP910';

        $this->info("Linking size options to {$groupCode} options...");

        // Get the option group
        $optionGroup = ErpOptionGroup::where('code', $groupCode)->first();

        if (! $optionGroup) {
            $this->error("Option group {$groupCode} not found!");

            return Command::FAILURE;
        }

        // Get size options
        $sizeQuery = SizeOption::query();
        if ($orderCode) {
            $sizeQuery->where('order_code', $orderCode);
        }
        $sizeOptions = $sizeQuery->get();

        if ($sizeOptions->isEmpty()) {
            $this->error('No size options found!');

            return Command::FAILURE;
        }

        // Get all options in this group
        $erpOptions = ErpOption::where('erp_option_group_id', $optionGroup->id)->get();

        $linkedCount = 0;
        $skippedCount = 0;

        foreach ($erpOptions as $erpOption) {
            // Try to find a matching size option based on label
            $matchedSize = null;

            foreach ($sizeOptions as $sizeOption) {
                // Check if the ERP option label contains the size name
                // Example: "(실내)하이배너-H(1800)거치대" contains "1800"
                // and size option "하이배너-H(1800)" also contains "1800"

                // Extract the size number from size option name
                if (preg_match('/\((\d+)\)/', $sizeOption->name, $matches)) {
                    $sizeNumber = $matches[1];

                    // Check if ERP option label contains this size number
                    if (str_contains($erpOption->label, $sizeNumber)) {
                        $matchedSize = $sizeOption;
                        break;
                    }
                }
            }

            if ($matchedSize) {
                // Check if already linked
                if ($erpOption->size_option_id == $matchedSize->id) {
                    $this->line("Skipped: {$erpOption->label} (already linked to {$matchedSize->name})");
                    $skippedCount++;
                } else {
                    $erpOption->size_option_id = $matchedSize->id;
                    $erpOption->save();
                    $this->info("Linked: {$erpOption->label} -> {$matchedSize->name}");
                    $linkedCount++;
                }
            } else {
                // If no match found, set to null (available for all sizes)
                $this->line("No match: {$erpOption->label}");
                $skippedCount++;
            }
        }

        $this->info("Done! Linked: {$linkedCount}, Skipped: {$skippedCount}");

        return Command::SUCCESS;
    }
}
