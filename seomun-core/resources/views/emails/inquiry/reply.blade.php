<tr align="center">
    <td align="center">
        <!-- 흰색 -->
        <table cellspacing="0" cellpadding="0" align="center" width="660px" bgcolor="#ffffff"
            style="background:#ffffff;max-width:660px;margin:0 auto;">
            <tbody>
                <tr>
                    <td height="40px"></td>
                </tr>
                <tr>
                    <td align="center" height="30px"
                        style="font-size:36px;font-family:'Noto Sans',sans-serif,'맑은고딕',Malgun Gothic,'굴림',gulim;letter-spacing:-1px;color:#424240;line-height:1em;">
                        <font size="5" color="#424240" face="Noto Sans">1:1문의에</font><br>
                        <span class="c_title_span" style="color:#ff782d;font-weight:600;line-height:1em;">
                            <font size="5" color="#ff782d" face="Noto Sans"><strong>답변</strong></font>
                        </span>
                        <font size="5" color="#424240" face="Noto Sans">이 등록되었습니다.</font>
                    </td>
                </tr>
                <tr>
                    <td height="10px"></td>
                </tr>
                <tr>
                    <td height="25px"></td>
                </tr>
                <tr>
                    <td bgcolor="#e5e5e5" height="1px"></td>
                </tr>
                <tr>
                    <td height="30px"></td>
                </tr>
                <tr>
                    <td>
                        <!-- 내용 -->
                        <table cellspacing="0" cellpadding="0" align="center" width="100%">
                            <tbody>
                                <tr>
                                    <td width="30px"></td>
                                    <td style="font-size:14px;color:#696969;">
                                        <font size="2" color="#696969"><strong>안녕하세요. <strong>{{ optional($inquiry->user)->name ?? '고객' }}</strong> 고객님! </strong></font><br>
                                        <font size="2" color="#696969">고객님께서 {{ $inquiry->created_at?->format('Y-m-d H:i') }}에 등록하신 1:1문의에 답변이
                                            등록되었습니다.</font>
                                    </td>
                                    <td width="30px"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" height="50px"></td>
                                </tr>
                                <tr>
                                    <td width="30px"></td>
                                    <th style="color:#424240;font-weight:600;" align="left">
                                        문의정보
                                    </th>
                                    <td width="30px"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" height="10px"></td>
                                </tr>
                                <tr>
                                    <td width="30px"></td>
                                    <td height="2px" bgcolor="#424240"></td>
                                    <td width="30px"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" height="10px"></td>
                                </tr>
                                <tr>
                                    <td width="30px"></td>
                                    <td>
                                        <table cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                            <tbody>
                                                <tr>
                                                    <th align="left" width="15%"
                                                        style="text-align:left;font-size:14px;font-weight:normal;width:15%;color:#696969;">
                                                        <font size="2" color="#696969"><strong>문의 카테고리</strong></font>
                                                    </th>
                                                    <td align="left"
                                                        style="text-align:left;font-size:14px;color:#696969;">
                                                        <font size="2" color="#696969">{{ $inquiry->category }}</font>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th align="left" width="15%"
                                                        style="text-align:left;font-size:14px;font-weight:normal;width:15%;color:#696969;">
                                                        <font size="2" color="#696969"><strong>문의 제목</strong></font>
                                                    </th>
                                                    <td align="left"
                                                        style="text-align:left;font-size:14px;color:#696969;">
                                                        <font size="2" color="#696969">{{ $inquiry->title }}</font>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th align="left" width="15%"
                                                        style="text-align:left;font-size:14px;font-weight:normal;width:15%;color:#696969;">
                                                        <font size="2" color="#696969"><strong>배송지정보</strong></font>
                                                    </th>
                                                    <td align="left"
                                                        style="text-align:left;font-size:14px;color:#696969;">
                                                        <font size="2" color="#696969">{{ $inquiry->created_at?->format('Y-m-d H:i') }}</font>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td width="30px"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" height="40px"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" align="center">
                                        <table cellspacing="0" cellpadding="0" width="280"
                                            style="width:280px;text-align:center;">
                                            <tbody>
                                                <tr>
                                                    <td width="280" height="50" align="center" bgcolor="#ff782d"
                                                        style="#ffffff">
                                                        <a style="width:280px;height:50px;line-height:50px;background:#ff782d;color:#ffffff;border:0;display:block;text-decoration:none;"
                                                            href="{{ $replyUrl }}"
                                                            <font color="#ffffff">문의내역 상세보기</font>
                                                        </a>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="3" height="30px"></td>
                                </tr>
                            </tbody>
                        </table>
                        <!-- //내용 -->
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- //흰색 -->
    </td>
</tr>
