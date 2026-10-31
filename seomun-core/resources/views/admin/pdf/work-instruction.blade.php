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
        body { font-family: NanumGothic, sans-serif; font-size: 10pt; margin: 20px; }
        .page { padding: 10px; }
        .page-break { page-break-after: always; }
        h2 { font-size: 14pt; text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
        h4 { font-size: 10pt; margin: 10px 0 5px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .info-table th,
        .info-table td { border: 1px solid #ccc; padding: 6px 8px; }
        .info-table th { background: #f5f5f5; width: 80px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th,
        .items-table td { border: 1px solid #ccc; padding: 5px 8px; }
        .items-table th { background: #f5f5f5; }
        .barcode-box { margin-top: 24px; border: 1px solid #ccc; padding: 10px; font-size: 9pt; color: #666; }
        .barcode-hint { margin-top: 8px; font-size: 8pt; color: #999; }
    </style>
</head>
<body>
    @foreach ($orders as $loop_index => $order)
        <div class="page">
            <h2>작업지시서</h2>
            <table class="info-table">
                <tr>
                    <th>주문번호</th>
                    <td><strong>{{ $order->order_number }}</strong></td>
                    <th>주문일시</th>
                    <td>{{ $order->created_at?->format('Y-m-d H:i') ?? '-' }}</td>
                </tr>
                <tr>
                    <th>수령인</th>
                    <td>{{ $order->recipient_name ?? $order->user?->name ?? '-' }}</td>
                    <th>상태</th>
                    <td>{{ $order->status ?? '-' }}</td>
                </tr>
                <tr>
                    <th>배송주소</th>
                    <td colspan="3">
                        {{ trim(($order->shipping_address ?? '') . ' ' . ($order->shipping_address_detail ?? '')) ?: '-' }}
                    </td>
                </tr>
                @if ($order->customer_note)
                <tr>
                    <th>고객요청</th>
                    <td colspan="3">{{ $order->customer_note }}</td>
                </tr>
                @endif
            </table>

            <h4>주문 상품</h4>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>상품명</th>
                        <th>SKU</th>
                        <th>수량</th>
                        <th>금액</th>
                        <th>생산일수</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($order->items as $item)
                    <tr>
                        <td>{{ $item->product?->name ?? $item->title ?? '-' }}</td>
                        <td>{{ $item->product?->sku ?? '-' }}</td>
                        <td style="text-align:center">{{ $item->quantity }}</td>
                        <td style="text-align:right">{{ number_format($item->total_price ?? 0) }}원</td>
                        <td style="text-align:center">{{ $item->production_days ? $item->production_days . '일' : '-' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="barcode-box">
                <p>바코드: {{ $order->order_number }}</p>
                <p class="barcode-hint">스캔 시 상태 자동 변경: 결제완료 → 인쇄중 → 후가공 → 배송준비</p>
            </div>
        </div>
        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>
