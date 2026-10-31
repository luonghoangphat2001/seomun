<?php

namespace App\Console\Commands;

use App\Models\ErpOption;
use App\Models\OrderCodeOptionMapping;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportOptionImages extends Command
{
    protected $signature = 'import:option-images {--dry-run : Show what would be imported without making changes}';

    protected $description = 'Import images from public/images folder to database';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        $this->info('Starting image import...');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        $basePath = public_path('images');

        // ========================================
        // 1. Import Order Code Images
        // ========================================
        $this->info('');
        $this->info('=== Importing Order Code Images ===');

        $orderCodePath = $basePath.'/orderCode';

        if (! File::exists($orderCodePath)) {
            $this->error("Order code path not found: $orderCodePath");
        } else {
            $orderCodeFiles = File::files($orderCodePath);

            $this->info('Found '.count($orderCodeFiles).' order code images');

            foreach ($orderCodeFiles as $file) {
                $filename = $file->getFilename();
                $extension = $file->getExtension();

                // Extract order code from filename (e.g., "9403.jpg" -> "9403")
                $orderCode = str_replace('.'.$extension, '', $filename);

                // Validate order code is numeric
                if (! is_numeric($orderCode)) {
                    $this->warn("  Skipping invalid order code filename: $filename");

                    continue;
                }

                $imagePath = '/images/orderCode/'.$filename;

                // Find order code mapping in database
                $orderCodeMapping = OrderCodeOptionMapping::where('order_code', $orderCode)->first();

                if ($orderCodeMapping) {
                    if ($dryRun) {
                        $this->line("  [DRY RUN] Would update order_code=$orderCode -> url_image=$imagePath");
                    } else {
                        // Debug: Show current value before update
                        $this->line("  DEBUG: Found order_code=$orderCode, current url_image=".($orderCodeMapping->url_image ?? 'NULL'));

                        $updated = $orderCodeMapping->update(['url_image' => $imagePath]);

                        // Debug: Check if update was successful
                        $this->line("  DEBUG: Update returned=$updated, rows affected=".$orderCodeMapping->wasChanged());

                        // Refresh to get updated value
                        $orderCodeMapping->refresh();
                        $this->line('  DEBUG: After refresh, url_image='.($orderCodeMapping->url_image ?? 'NULL'));

                        $this->info("  ✓ Updated order_code=$orderCode -> url_image=$imagePath");
                    }
                } else {
                    $this->warn("  ✗ Order code not found in database: $orderCode");
                }
            }
        }

        // ========================================
        // 2. Import Option Preview Images
        // ========================================
        $this->info('');
        $this->info('=== Importing Option Preview Images ===');

        $optionsPath = $basePath.'/options';

        if (! File::exists($optionsPath)) {
            $this->error("Options path not found: $optionsPath");
        } else {
            $optionGroups = File::directories($optionsPath);

            $this->info('Found '.count($optionGroups).' option group folders');

            foreach ($optionGroups as $optionGroupPath) {
                $optionGroupCode = basename($optionGroupPath);
                $this->info("  Processing option group: $optionGroupCode");

                $optionFiles = File::files($optionGroupPath);

                foreach ($optionFiles as $file) {
                    $filename = $file->getFilename();
                    $extension = $file->getExtension();

                    // Extract option code from filename (e.g., "90301.jpg" -> "90301")
                    $optionCode = str_replace('.'.$extension, '', $filename);

                    // Validate option code is numeric
                    if (! is_numeric($optionCode)) {
                        $this->warn("    Skipping invalid option code filename: $filename");

                        continue;
                    }

                    $imagePath = '/images/options/'.$optionGroupCode.'/'.$filename;

                    // Find option in database
                    $option = ErpOption::where('code', $optionCode)->first();

                    if ($option) {
                        if ($dryRun) {
                            $this->line("    [DRY RUN] Would update option=$optionCode -> preview_image=$imagePath");
                        } else {
                            // Debug: Show current value before update
                            $this->line("    DEBUG: Found option=$optionCode, current preview_image=".($option->preview_image ?? 'NULL'));

                            $updated = $option->update(['preview_image' => $imagePath]);

                            // Debug: Check if update was successful
                            $this->line("    DEBUG: Update returned=$updated, wasChanged=".($option->wasChanged() ? 'true' : 'false'));

                            // Refresh to get updated value
                            $option->refresh();
                            $this->line('    DEBUG: After refresh, preview_image='.($option->preview_image ?? 'NULL'));

                            $this->info("    ✓ Updated option=$optionCode -> preview_image=$imagePath");
                        }
                    } else {
                        $this->warn("    ✗ Option not found in database: $optionCode");
                    }
                }
            }
        }

        $this->info('');
        $this->info('Image import completed!');

        return 0;
    }
}
