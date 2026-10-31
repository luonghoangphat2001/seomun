<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    abstract protected function getFiltersClass(): string;

    public function scopeFilters(Builder $query, array $filters = [])
    {
        $filters = $this->getFilterNotNull($filters);

        return app($this->getFiltersClass())->apply($query, $filters);
    }

    private function getFilterNotNull(array $filters): array
    {
        return array_filter($filters, fn ($value) => $value !== null && $value !== '');
    }
}
