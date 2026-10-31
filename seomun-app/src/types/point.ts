export type PointHistory = {
  id: number;
  date: string; // yyyy.mm.dd
  type: string; // 구분 (e.g. 골드(4%))
  earned: number; // 적립
  used: number; // 사용
  balance: number; // 잔액
  expired: number; // 소멸
  expireDate: string; // 사용기한
  earnOrderNo: string; // 적립주문번호
  useOrderNo: string; // 사용주문번호
};
