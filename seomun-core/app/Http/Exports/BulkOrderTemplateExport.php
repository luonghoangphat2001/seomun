<?php

namespace App\Http\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Excel template for bulk order (단체 주문).
 * Row 1: instruction (gray), Row 2: Korean labels (gray), Row 3: technical names (gray), Row 4: example (yellow).
 * Spec: API_SPEC_PROPOSAL_MISSING_APIS.md §6
 */
class BulkOrderTemplateExport implements FromArray, WithStyles
{
    protected array $columns;

    public function __construct(?array $columns = null)
    {
        $this->columns = $columns ?? $this->defaultColumns();
    }

    public function array(): array
    {
        $hasBack = false;
        foreach ($this->columns as $col) {
            if (! empty($col['side']) && $col['side'] === 'back') {
                $hasBack = true;
                break;
            }
        }

        $instruction = $hasBack
            ? '앞/뒷면 텍스트 필드 (노란색 영역에만 데이터를 입력해주세요. 회색 영역은 편집하실 수 없습니다.)'
            : '앞면 (노란색 영역에만 데이터를 입력해주세요. 회색 영역은 편집하실 수 없습니다.)';

        $row1 = array_merge([$instruction], array_fill(1, count($this->columns) - 1, ''));
        $row2 = array_column($this->columns, 'label');
        $row3 = array_column($this->columns, 'technical');
        $row4 = array_column($this->columns, 'example');

        return [
            $row1,
            $row2,
            $row3,
            $row4,
        ];
    }

    public function styles(Worksheet $sheet): void
    {
        $count = max(1, count($this->columns));
        $lastCol = Coordinate::stringFromColumnIndex($count);
        $gray = 'D3D3D3';
        $yellow = 'FFFF00';

        $sheet->getStyle('A1:'.$lastCol.'3')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setRGB($gray);
        $sheet->getStyle('A4:'.$lastCol.'4')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setRGB($yellow);

        $sheet->mergeCells('A1:'.$lastCol.'1');
    }

    /**
     * Legacy default columns when product has no template or no text layers.
     *
     * @return array<int, array{label: string, technical: string, example: string, side?: string}>
     */
    public static function fallbackColumnDefinitions(): array
    {
        return [
            ['label' => '이름', 'technical' => 'name-1', 'example' => '(예시)홍길동'],
            ['label' => '영문이름', 'technical' => 'eng_lastnameupper_part-1', 'example' => 'Kildong Hong'],
            ['label' => '부서/직급', 'technical' => 'part-1', 'example' => '총무팀 / 파트장'],
            ['label' => '영문부서/직급', 'technical' => 'eng_part-1', 'example' => 'General Affairs Team / Part Leader'],
            ['label' => '핸드폰', 'technical' => 'hp-1', 'example' => '010 1234 5678'],
            ['label' => '전화번호', 'technical' => 'tel-1', 'example' => '070 2234 5678'],
            ['label' => '이메일', 'technical' => 'email-2', 'example' => 'kildong.hong@yanolja.com'],
            ['label' => '팩스 (*업무상 필요한 경우에만 기입)', 'technical' => 'fax-1', 'example' => ''],
            ['label' => '주소', 'technical' => 'addr1-1', 'example' => '06176 서울 강남구 테헤란로108길 42'],
            ['label' => '영문주소', 'technical' => 'eng_addr-1', 'example' => '42, Teheran-ro 108-gil, Gangnam-gu, Seoul, Korea, 06176'],
        ];
    }

    protected function defaultColumns(): array
    {
        return self::fallbackColumnDefinitions();
    }
}
