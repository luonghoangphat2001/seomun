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
        body { font-family: NanumGothic, sans-serif; font-size: 10pt; margin: 30px; color: #222; }
        h2 { font-size: 16pt; text-align: center; margin-bottom: 4px; }
        .subtitle { text-align: center; font-size: 9pt; color: #888; margin-bottom: 20px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .info-table th,
        .info-table td { border: 1px solid #ccc; padding: 6px 10px; }
        .info-table th { background: #f5f5f5; width: 120px; text-align: left; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .items-table th,
        .items-table td { border: 1px solid #ccc; padding: 6px 8px; text-align: center; }
        .items-table th { background: #f0f0f0; }
        .items-table td.name { text-align: left; }
        .totals { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .totals td { padding: 5px 10px; }
        .totals td.label { text-align: right; color: #555; }
        .totals td.value { text-align: right; font-weight: bold; width: 120px; }
        .totals tr.grand td { border-top: 2px solid #222; font-size: 12pt; }
        .footer { text-align: center; font-size: 8pt; color: #aaa; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <h2>영수증 / Receipt</h2>
    <div class="subtitle">{{ $transaction->paid_at?->format('Y-m-d H:i:s') }}</div>

    <table class="info-table">
        <tr>
            <th>주문번호</th>
            <td>{{ $order?->order_number ?? '-' }}</td>
            <th>결제수단</th>
            <td>{{ $transaction->payment_method ?? '-' }}</td>
        </tr>
        <tr>
            <th>고객사</th>
            <td>{{ $customer?->company_name ?? '-' }}</td>
            <th>결제상태</th>
            <td>{{ $transaction->status ?? '-' }}</td>
        </tr>
        @if ($transaction->card_name)
        <tr>
            <th>카드명</th>
            <td>{{ $transaction->card_name }}</td>
            <th>카드번호</th>
            <td>{{ $transaction->card_number ?? '-' }}</td>
        </tr>
        @endif
        @if ($transaction->pg_transaction_id)
        <tr>
            <th>승인번호</th>
            <td colspan="3">{{ $transaction->pg_transaction_id }}</td>
        </tr>
        @endif
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>#</th>
                <th class="name" style="text-align:left;">제품명</th>
                <th>수량</th>
                <th>단가</th>
                <th>소계</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($items as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td class="name">{{ $item['product_name'] }}</td>
                <td>{{ $item['quantity'] }}</td>
                <td>{{ number_format($item['price']) }}원</td>
                <td>{{ number_format($item['price'] * $item['quantity']) }}원</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="label">공급가액</td>
            <td class="value">{{ number_format($order?->subtotal_amount ?? 0) }}원</td>
        </tr>
        @if (($order?->discount_amount ?? 0) > 0)
        <tr>
            <td class="label">할인</td>
            <td class="value">-{{ number_format($order->discount_amount) }}원</td>
        </tr>
        @endif
        <tr>
            <td class="label">부가세 (VAT)</td>
            <td class="value">{{ number_format($order?->tax_amount ?? 0) }}원</td>
        </tr>
        <tr class="grand">
            <td class="label">합계</td>
            <td class="value">{{ number_format($order?->total_amount ?? $transaction->amount) }}원</td>
        </tr>
    </table>

    <div class="footer">본 영수증은 Seomun 관리자 시스템에서 발행되었습니다.</div>
</body>
</html>
