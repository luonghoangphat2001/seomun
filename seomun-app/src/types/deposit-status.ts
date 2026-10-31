export type DepositStatus = {
  id: number; // 번호 (Number)
  method: string; // 거래방법 (Transaction Method)
  date: string; // 거래일 (Transaction Date)
  amount: number; // 입출금 (Deposit/Withdrawal Amount)
  depositor: string; // 입금자 (Depositor Name)
  order_number: string;
};
