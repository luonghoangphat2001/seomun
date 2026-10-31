<?php

namespace App\Console\Commands;

use App\Models\SavedProductOption;
use Illuminate\Console\Command;

class PruneExpiredSavedProductOptions extends Command
{
    protected $signature = 'saved-product-options:prune-expired {--chunk=500 : Rows per delete batch}';

    protected $description = 'Delete saved product options past expires_at (1-year retention)';

    public function handle(): int
    {
        $chunk = max(1, (int) $this->option('chunk'));
        $total = 0;

        do {
            $ids = SavedProductOption::query()
                ->where('expires_at', '<=', now())
                ->limit($chunk)
                ->pluck('id');

            if ($ids->isEmpty()) {
                break;
            }

            $deleted = SavedProductOption::query()->whereIn('id', $ids)->delete();
            $total += $deleted;
        } while ($ids->count() === $chunk);

        $this->info("Pruned {$total} expired saved product option(s).");

        return Command::SUCCESS;
    }
}
