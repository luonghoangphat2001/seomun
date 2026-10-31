<div class="section-title">공급자 정보</div>
<table>
    <tr>
        <th>상호</th>
        <td>{{ $companySetting->company_name ?: '-' }}</td>
        <th>사업자등록번호</th>
        <td>{{ $companySetting->business_registration_number ?: '-' }}</td>
    </tr>
    <tr>
        <th>대표자명</th>
        <td>{{ $companySetting->representative_name ?: '-' }}</td>
        <th>전화번호</th>
        <td>{{ $companySetting->phone ?: '-' }}</td>
    </tr>
    <tr>
        <th>업종</th>
        <td>{{ $companySetting->industry_type ?: '-' }}</td>
        <th>업태</th>
        <td>{{ $companySetting->business_type ?: '-' }}</td>
    </tr>
    <tr>
        <th>주소</th>
        <td colspan="3">{{ $companySetting->address ?: '-' }}</td>
    </tr>
</table>

<div class="stamp-area" align="right">
    공급자: {{ $companySetting->company_name ?: '-' }}&nbsp;&nbsp;&nbsp;&nbsp;(인)
    @if ($stampDataUri)
        <img class="company-stamp" src="{{ $stampDataUri }}" alt="회사 도장" width="58">
    @endif
</div>
