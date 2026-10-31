import { BankAccountKey, BankDepositMatchReason, BankDepositStatus } from '../enums';
import type { BankDepositListREQ } from '../api/popbill-deposit.request';
import type { BankDepositListRESP, BankDepositSyncStatusRESP, BankDepositRESP } from '../api/popbill-deposit.response';

const MOCK_BANK_DEPOSITS: BankDepositRESP[] = [
  {
    id: 101,
    account_key: BankAccountKey.WOORI,
    provider_tid: '02610011234567890120261001000001',
    amount: '2169.00',
    deposited_at: '2026-10-01T02:15:00.000000Z',
    remarks: ['홍길동', '031001', '인터넷'],
    status: BankDepositStatus.UNMATCHED,
    match_reason: BankDepositMatchReason.AMBIGUOUS_MATCH,
    payment_transaction_id: null,
    order_id: null,
    matched_by: null,
    admin_note: null,
    matched_at: null,
    created_at: '2026-10-01T02:16:00.000000Z',
    updated_at: '2026-10-01T02:16:00.000000Z',
  },
  {
    id: 102,
    account_key: BankAccountKey.HANA,
    provider_tid: '08110021234567890120261001000002',
    amount: '15000.00',
    deposited_at: '2026-10-01T01:30:00.000000Z',
    remarks: ['김영희', '모바일뱅킹', '이체'],
    status: BankDepositStatus.MATCHED,
    match_reason: BankDepositMatchReason.EXACT_MATCH,
    payment_transaction_id: 'TXN-20261001014227-8D400WTB',
    order_id: 'PRINTLY20261001-85468',
    matched_by: null,
    admin_note: null,
    matched_at: '2026-10-01T01:31:00.000000Z',
    created_at: '2026-10-01T01:31:00.000000Z',
    updated_at: '2026-10-01T01:31:00.000000Z',
  },
  {
    id: 103,
    account_key: BankAccountKey.IM,
    provider_tid: '03110031234567890120261001000003',
    amount: '42000.00',
    deposited_at: '2026-10-01T00:50:00.000000Z',
    remarks: ['주식회사 테스트', 'ATM', '입금'],
    status: BankDepositStatus.MATCHED,
    match_reason: BankDepositMatchReason.MANUAL,
    payment_transaction_id: 'TXN-20261001013651-3Q4AL6QR',
    order_id: 'PRINTLY20261001-03681',
    matched_by: 9,
    admin_note: '입금자 정보 확인 후 수동 승인',
    matched_at: '2026-10-01T00:55:00.000000Z',
    created_at: '2026-10-01T00:51:00.000000Z',
    updated_at: '2026-10-01T00:55:00.000000Z',
  },
];

export function createMockBankDepositListResponse(params: BankDepositListREQ): BankDepositListRESP {
  const filtered = MOCK_BANK_DEPOSITS.filter(
    (deposit) =>
      (!params.status || deposit.status === params.status) && (!params.bank_account_key || deposit.account_key === params.bank_account_key),
  );
  const perPage = params.per_page ?? 10;
  const currentPage = params.page ?? 1;
  const totalPage = Math.max(1, Math.ceil(filtered.length / perPage));
  const startIndex = (currentPage - 1) * perPage;

  return {
    success: true,
    message: '[Development mock] Bank deposits loaded.',
    data: { bank_deposits: filtered.slice(startIndex, startIndex + perPage) },
    pagination: {
      current_page: currentPage,
      per_page: perPage,
      total_page: totalPage,
      total_item: filtered.length,
    },
  };
}

export function createMockBankDepositSyncStatusResponse(): BankDepositSyncStatusRESP {
  return {
    success: true,
    message: '[Development mock] POPBiLL sync status loaded.',
    data: [
      {
        id: 1,
        account_key: BankAccountKey.WOORI,
        requested_at: '2026-10-01T02:00:00.000000Z',
        start_date: '2026-09-30T00:00:00.000000Z',
        end_date: '2026-10-01T00:00:00.000000Z',
        completed_through: '2026-10-01T00:00:00.000000Z',
        last_success_at: '2026-10-01T02:00:04.000000Z',
        last_error_at: null,
        last_error_code: null,
        created_at: '2026-10-01T02:00:00.000000Z',
        updated_at: '2026-10-01T02:00:04.000000Z',
      },
      {
        id: 2,
        account_key: BankAccountKey.HANA,
        requested_at: '2026-10-01T02:00:00.000000Z',
        start_date: '2026-09-30T00:00:00.000000Z',
        end_date: '2026-10-01T00:00:00.000000Z',
        completed_through: '2026-09-30T00:00:00.000000Z',
        last_success_at: '2026-10-01T01:00:03.000000Z',
        last_error_at: '2026-10-01T02:00:05.000000Z',
        last_error_code: 503,
        created_at: '2026-10-01T02:00:00.000000Z',
        updated_at: '2026-10-01T02:00:05.000000Z',
      },
    ],
  };
}
