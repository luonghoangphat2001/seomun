<?php

namespace App\Http\Exports\Admin;

use App\Http\Exports\Admin\MemberStatistics\ActiveMembersSheet;
use App\Http\Exports\Admin\MemberStatistics\MembersByLevelSheet;
use App\Http\Exports\Admin\MemberStatistics\MembersByPathSheet;
use App\Http\Exports\Admin\MemberStatistics\NewMembersSheet;
use App\Http\Exports\Admin\MemberStatistics\WithdrawnMembersSheet;
use App\Services\Admin\AdminMemberStatisticsService;
use Illuminate\Support\Arr;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AdminMemberStatisticsExport implements WithMultipleSheets
{
    use Exportable;

    protected array $filters;

    protected AdminMemberStatisticsService $adminMemberStatisticsService;

    protected string $locale;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
        $this->adminMemberStatisticsService = app(AdminMemberStatisticsService::class);
        $this->locale = Arr::get($filters, 'locale', 'en');
    }

    public function sheets(): array
    {
        return [
            new NewMembersSheet($this->adminMemberStatisticsService, $this->filters),
            new WithdrawnMembersSheet($this->adminMemberStatisticsService, $this->filters),
            new ActiveMembersSheet($this->adminMemberStatisticsService, $this->filters),
            new MembersByLevelSheet($this->adminMemberStatisticsService, $this->filters),
            new MembersByPathSheet($this->adminMemberStatisticsService, $this->filters),
        ];
    }
}
