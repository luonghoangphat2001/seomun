<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'NanumGothic';
            font-style: normal;
            font-weight: normal;
            src: url('{{ $fontPath }}') format('truetype');
        }
        @font-face {
            font-family: 'NanumGothic';
            font-style: normal;
            font-weight: bold;
            src: url('{{ $fontPathBold }}') format('truetype');
        }
        body { font-family: NanumGothic, sans-serif; font-size: 10pt; margin: 34px; color: #222; }
        h1 { font-size: 22pt; text-align: center; margin: 0 0 6px; }
        .subtitle { text-align: center; color: #777; margin-bottom: 22px; }
        .section-title { font-size: 12pt; font-weight: bold; margin: 18px 0 8px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d8d8d8; padding: 8px 10px; }
        th { background: #f7f7f7; text-align: left; width: 120px; }
        .items th { background: #f0f0f0; text-align: center; width: auto; }
        .items td { text-align: center; }
        .items td.name { text-align: left; }
        .summary { margin-top: 14px; }
        .summary td.label { text-align: right; background: #fafafa; }
        .summary td.value { text-align: right; width: 150px; font-weight: bold; }
        .summary tr.highlight td { background: #f5f5f5; }
        .summary tr.total td { border-top: 2px solid #222; font-size: 13pt; }
        .summary tr.total td.value { color: #f5a000; }
        .note { margin-top: 22px; color: #777; font-size: 9pt; line-height: 1.6; }
        .footer { margin-top: 32px; padding-top: 10px; border-top: 1px solid #eee; text-align: center; color: #aaa; font-size: 8pt; }
        .stamp-area { margin-top: 10px; text-align: right; font-size: 9pt; color: #555; }
    </style>
</head>
<body>
    @php
        $formatMoney = fn ($value) => number_format((float) ($value ?? 0)).'원';
        $paymentStatusLabel = match($order->payment_status ?? '') {
            'paid'      => '결제완료',
            'partial'   => '부분결제',
            'pending'   => '결제대기',
            'unpaid'    => '미결제',
            'refunded'  => '환불',
            'cancelled' => '취소',
            default     => $order->payment_status ?? '-',
        };
    @endphp

    <h1>거래명세서</h1>
    <div class="subtitle">Transaction Statement · {{ $issuedAt->format('Y-m-d H:i') }}</div>

    @include('pdf.partials.company-information')

    <div class="section-title">거래처 정보</div>
    <table>
        <tr>
            <th>주문번호</th>
            <td>{{ $order->order_number }}</td>
            <th>주문일자</th>
            <td>{{ $order->placed_at?->format('Y-m-d') ?? $order->created_at?->format('Y-m-d') ?? '-' }}</td>
        </tr>
        <tr>
            <th>주문자</th>
            <td>{{ $order->contact_name ?? '-' }}</td>
            <th>연락처</th>
            <td>{{ $order->contact_phone ?? '-' }}</td>
        </tr>
        <tr>
            <th>상품명</th>
            <td>{{ $order->product_name ?? '-' }}</td>
            <th>결제상태</th>
            <td>{{ $paymentStatusLabel }}</td>
        </tr>
        <tr>
            <th>배송지</th>
            <td colspan="3">[{{ $order->shipping_postcode ?? '-' }}] {{ $order->shipping_address ?? '' }} {{ $order->shipping_address_detail ?? '' }}</td>
        </tr>
    </table>

    <div class="section-title">거래 내역</div>
    <table class="items">
        <thead>
            <tr>
                <th>#</th>
                <th class="name">품목</th>
                <th>수량</th>
                <th>건수</th>
                <th>단가</th>
                <th>공급가액</th>
                <th>부가세</th>
                <th>합계</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $index => $item)
                @php
                    $itemTotal       = (float) ($item->total_price ?? 0);
                    $itemSupply      = round($itemTotal / 1.1, 0);
                    $itemVat         = round($itemTotal - $itemSupply, 0);
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td class="name">{{ $item->title ?? '-' }}</td>
                    <td>{{ $item->quantity ?? '-' }} {{ $item->unit ?? '' }}</td>
                    <td>{{ $item->multiplier ?? 1 }}</td>
                    <td>{{ $formatMoney($item->unit_price) }}</td>
                    <td>{{ $formatMoney($itemSupply) }}</td>
                    <td>{{ $formatMoney($itemVat) }}</td>
                    <td>{{ $formatMoney($itemTotal) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="summary">
        <tr>
            <td class="label">소계</td>
            <td class="value">{{ $formatMoney($summary['subtotal'] ?? 0) }}</td>
        </tr>
        <tr>
            <td class="label">할인</td>
            <td class="value">-{{ $formatMoney($summary['discount'] ?? 0) }}</td>
        </tr>
        <tr>
            <td class="label">포인트 사용</td>
            <td class="value">-{{ $formatMoney($summary['point_discount'] ?? 0) }}</td>
        </tr>
        <tr>
            <td class="label">배송비</td>
            <td class="value">{{ $formatMoney($summary['shipping_fee'] ?? 0) }}</td>
        </tr>
        <tr class="highlight">
            <td class="label">공급가액</td>
            <td class="value">{{ $formatMoney($summary['supply_price'] ?? 0) }}</td>
        </tr>
        <tr class="highlight">
            <td class="label">부가세 (10%)</td>
            <td class="value">{{ $formatMoney($summary['vat'] ?? 0) }}</td>
        </tr>
        <tr class="total">
            <td class="label">합계금액</td>
            <td class="value">{{ $formatMoney($summary['total'] ?? 0) }}</td>
        </tr>
        <tr>
            <td class="label">입금액</td>
            <td class="value">{{ $formatMoney($summary['paid_amount'] ?? 0) }}</td>
        </tr>
    </table>

    <div class="note">
        본 거래명세서는 주문 상세에 저장된 주문/결제 금액 기준으로 자동 생성되었습니다.<br>
        공급가액 = 합계금액 ÷ 1.1 &nbsp;|&nbsp; 부가세 = 합계금액 - 공급가액
    </div>

    <div class="footer">Seomun Printing transaction statement generated by system.</div>
</body>
</html>
