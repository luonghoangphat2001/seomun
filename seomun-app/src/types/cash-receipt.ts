export type CashReceipt = {
  id: number;
  issueDate: string; // 발생일
  approvalNumber: string; // 승인번호
  orderAmount: number; // 주문원가
  shippingFee: number; // 배송비
  discountAmount: number; // 할인금액
  totalAmount: number; // 합계금액
  supplyPrice: number; // 공급가액
  vat: number; // 부가세
};
