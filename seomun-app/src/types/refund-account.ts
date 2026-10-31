import { RefundHistoryStatus } from '@/enums/refund-account';

export type RefundAccount = {
  id: number;
  settlementDate: string; // 정산일
  refundAmount: number; // 환불금액
  accountHolder: string; // 예금주
  bankCode?: string; // 은행 코드
  bankName: string; // 은행
  accountNumber: string; // 계좌번호
  depositDate: string; // 입금일
  status: RefundHistoryStatus; // 처리상태
};
