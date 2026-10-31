import { formatPhoneNumber } from '@/utils/format-phone';

import { CustomerApprovalStatus } from '../../enums';
import type { CustomerAuditLog, CustomerMember, MemberCompanyInfo, MemberDetail, MemberPermissionInfo } from '../../types/customer.type';
import type { CustomerBasicInfoFormValues, CustomerChangePasswordFormValues, CustomerCompanyInfoSubmitValues, CustomerListSearch } from '../schemas';
import {
  changeCustomerPasswordAPI,
  exportCustomerListAPI,
  getCustomerDetailAPI,
  getCustomerExportStatusAPI,
  getCustomerListAPI,
  getCustomerSearchFiltersAPI,
  getProxyLoginAPI,
  updateCustomerBasicInfoAPI,
} from './customer-list.api';
import { CustomerListWireApprovalStatus, CustomerListWireAuthority, CustomerListWireStatus } from './customer-list.request';
import type { CustomerBasicInfoUpdateREQ, CustomerChangePasswordREQ, CustomerListREQ, ExportCustomerListREQ } from './customer-list.request';
import type {
  CustomerDetailRawItem,
  CustomerDetailRawRESP,
  CustomerDetailRESP,
  CustomerExportRESP,
  CustomerListRawRESP,
  CustomerListRESP,
  CustomerMemberRawItem,
  CustomerSearchFiltersRESP,
  MemberCompanyRawItem,
  MemberModificationLogRawItem,
  MemberPermissionInfoRawItem,
} from './customer-list.response';

const sleep = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));
const CUSTOMER_EXPORT_MAX_ATTEMPTS = 10;
const CUSTOMER_EXPORT_POLL_INTERVAL_MS = 1_500;

export type CustomerExportResult = { fileUrl: string; fileName: string };

function normalizeWireApprovalStatus(value?: string): CustomerListWireApprovalStatus | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'approved') return CustomerListWireApprovalStatus.ACCEPTED;
  if (normalized === 'pending') return CustomerListWireApprovalStatus.PENDING;
  if (normalized === 'accepted') return CustomerListWireApprovalStatus.ACCEPTED;
  if (normalized === 'rejected') return CustomerListWireApprovalStatus.REJECTED;
  return undefined;
}

function normalizeWireStatus(value?: string): CustomerListWireStatus | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'active') return CustomerListWireStatus.ACTIVE;
  if (normalized === 'inactive') return CustomerListWireStatus.INACTIVE;
  if (normalized === 'withdrawn') return CustomerListWireStatus.WITHDRAWN;
  return undefined;
}

export function mapCustomerListSearchToRequest(search: CustomerListSearch): CustomerListREQ {
  return {
    page: search.page,
    per_page: search.per_page,
    sort_by: search.sort_by,
    sort_order: search.sort_order,
    search_term: search.search_term,
    approval_status: normalizeWireApprovalStatus(search.approval_status),
    status: normalizeWireStatus(search.status),
    authority: CustomerListWireAuthority.NORMAL_USER,
  };
}

function mapWireApprovalStatus(value: string): CustomerApprovalStatus {
  const normalized = value.toLowerCase();
  if (normalized === 'accepted' || normalized === 'approved') return CustomerApprovalStatus.APPROVED;
  if (normalized === 'rejected') return CustomerApprovalStatus.REJECTED;
  return CustomerApprovalStatus.PENDING;
}

function mapRawCustomerMember(item: CustomerMemberRawItem): CustomerMember {
  return {
    id: item.id,
    name: item.name,
    username: item.username,
    email: item.email,
    phone: item.phone,
    mobile: item.mobile,
    member_type: item.member_type ?? undefined,
    companyName: item.company_name ?? null,
    note: item.note ?? null,
    status: item.status,
    approvalStatus: {
      value: mapWireApprovalStatus(item.approval_status.value),
      label: item.approval_status.label,
    },
    authority: item.authority,
    isMasterAccount: item.authority.value?.toLowerCase() === 'master',
    dateOfJoining: item.date_of_joining,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapCustomerListResponse(response: CustomerListRawRESP): CustomerListRESP {
  const pagination =
    response.data.pagination ??
    response.pagination ??
    createPaginationFallback(response.data.members.length, response.data.members.length || undefined);

  return {
    success: response.success,
    message: response.message,
    data: {
      members: response.data.members.map(mapRawCustomerMember),
      pagination,
    },
  };
}

function mapRawMemberCompany(company: MemberCompanyRawItem) {
  return {
    companyName: company.company_name,
    businessRegistrationNumber: company.business_registration_number,
    representativeName: company.representative_name,
    industryType: company.industry_type,
    businessType: company.business_type,
    postcode: company.postcode,
    address: company.address,
    detailedAddress: company.detailed_address,
    taxInvoiceEmail: company.tax_invoice_email,
    businessRegistrationFile: company.business_registration_file,
  };
}

function mapRawMemberDetail(item: CustomerDetailRawItem): MemberDetail {
  return {
    ...mapRawCustomerMember(item),
    postcode: item.postcode,
    address: item.address,
    detailedAddress: item.detailed_address,
    fullAddress: item.full_address,
    company: item.customer ? mapRawMemberCompany(item.customer) : null,
    agreedAt: item.agreed_at,
    approvedAt: item.approved_at,
    approvedBy: item.approved_by,
    membershipTier: item.membership_tier,
    agreePrivacy: Boolean(item.agree_privacy),
    agreeTerms: Boolean(item.agree_terms),
    editableFields: item.editable_fields ?? {},
    refundBank: item.refund_bank ?? null,
    refundAccountNumber: item.refund_account_number ?? null,
    refundAccountName: item.refund_account_name ?? null,
    virtualAccount: item.virtual_account
      ? {
          provider: item.virtual_account.provider,
          accountNumber: item.virtual_account.account_number,
          bankCode: item.virtual_account.bank_code,
          customerName: item.virtual_account.customer_name,
          status: item.virtual_account.status,
        }
      : null,
  };
}

function mapRawMemberPermission(item?: MemberPermissionInfoRawItem): MemberPermissionInfo {
  return {
    membershipLevel: item?.membership_level ?? { value: '', label: '-' },
    availability: item?.availability ?? { value: false, label: '-' },
    approvalStatus: item?.approval_status ?? { value: '', label: '-' },
    authority: { value: item?.authority.value ?? '', label: item?.authority.label ?? '-' },
    status: item?.status ?? { value: '', label: '-' },
    canApprove: Boolean(item?.can_approve),
    canRestore: Boolean(item?.can_restore),
  };
}

/** One modification log carries several changed fields; the audit UI lists one row per field. */
function mapRawModificationLogs(logs: MemberModificationLogRawItem[]): CustomerAuditLog[] {
  return logs.flatMap((log) => {
    const changedFields = Object.keys(log.fields.changes ?? log.fields.after ?? {});
    const changedBy = log.modified_by ? { id: log.modified_by.id, name: log.modified_by.name, email: log.modified_by.email } : null;

    return changedFields.map((field, index) => ({
      id: log.id * 100 + index,
      action: log.description,
      field,
      oldValue: formatAuditValue(log.fields.before?.[field]),
      newValue: formatAuditValue(log.fields.after?.[field] ?? log.fields.changes?.[field]),
      changedBy,
      changedAt: log.modified_at,
    }));
  });
}

function mapCustomerDetailResponse(response: CustomerDetailRawRESP): CustomerDetailRESP {
  return {
    success: response.success,
    message: response.message,
    data: {
      member: mapRawMemberDetail(response.data.member),
      permission: mapRawMemberPermission(response.data.permission_information),
      auditLogs: mapRawModificationLogs(response.data.activity_log?.information_modifications?.logs ?? []),
    },
  };
}

export function mapMemberDetailToBasicInfoFormValues(member?: MemberDetail): CustomerBasicInfoFormValues {
  return {
    name: member?.name ?? '',
    email: member?.email ?? '',
    phone: formatPhoneNumber(member?.phone),
    mobile: formatPhoneNumber(member?.mobile),
    postcode: member?.postcode ?? '',
    address: member?.address ?? '',
    detailed_address: member?.detailedAddress ?? '',
    note: member?.note ?? '',
    status: normalizeWireStatus(member?.status.value) ?? CustomerListWireStatus.ACTIVE,
  };
}

export function mapMemberCompanyInfoToFormValues(company?: MemberCompanyInfo | null): CustomerCompanyInfoSubmitValues {
  return {
    company_name: company?.companyName ?? '',
    business_registration_number: company?.businessRegistrationNumber ?? '',
    representative_name: company?.representativeName ?? '',
    industry_type: company?.industryType ?? '',
    business_type: company?.businessType ?? '',
    business_postcode: company?.postcode ?? '',
    business_address: company?.address ?? '',
    business_detailed_address: company?.detailedAddress ?? '',
    tax_invoice_email: company?.taxInvoiceEmail ?? '',
    business_registration_file: company?.businessRegistrationFile ?? null,
  };
}

// The update endpoint replaces the whole basic-information/company record, so every save
// (whichever section triggered it) must resend both sections' current values, not just the edited one.
export function mapCustomerFullInfoToRequest(
  memberId: number,
  values: CustomerBasicInfoFormValues & CustomerCompanyInfoSubmitValues,
): CustomerBasicInfoUpdateREQ {
  return {
    member_id: memberId,
    name: values.name,
    email: values.email,
    phone: values.phone.replace(/\D/g, ''),
    mobile: values.mobile.replace(/\D/g, ''),
    postcode: values.postcode,
    address: values.address,
    detailed_address: values.detailed_address,
    note: values.note,
    status: values.status,
    company_name: values.company_name,
    business_registration_number: values.business_registration_number,
    representative_name: values.representative_name,
    industry_type: values.industry_type,
    business_type: values.business_type,
    business_postcode: values.business_postcode,
    business_address: values.business_address,
    business_detailed_address: values.business_detailed_address,
    tax_invoice_email: values.tax_invoice_email,
    business_registration_file: values.business_registration_file ?? undefined,
  };
}

function createPaginationFallback(itemCount: number, perPage = 10) {
  return {
    current_page: 1,
    per_page: perPage,
    total_page: 1,
    total_item: itemCount,
  };
}

function formatAuditValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

export async function getCustomerListService(request: CustomerListREQ): Promise<CustomerListRESP> {
  const response = await getCustomerListAPI(request);
  return mapCustomerListResponse(response);
}

export async function getCustomerSearchFiltersService(): Promise<CustomerSearchFiltersRESP> {
  return getCustomerSearchFiltersAPI();
}

export async function getCustomerDetailService(memberId: number): Promise<CustomerDetailRESP> {
  return mapCustomerDetailResponse(await getCustomerDetailAPI(memberId));
}

export async function updateCustomerBasicInfoService(request: CustomerBasicInfoUpdateREQ) {
  return updateCustomerBasicInfoAPI(request);
}

export function mapChangePasswordFormValuesToRequest(memberId: number, values: CustomerChangePasswordFormValues): CustomerChangePasswordREQ {
  return {
    member_id: memberId,
    new_password: values.new_password,
  };
}

export async function changeCustomerPasswordService(request: CustomerChangePasswordREQ) {
  return changeCustomerPasswordAPI(request);
}

export async function getProxyLoginService(memberId: number) {
  return getProxyLoginAPI(memberId);
}

export async function exportCustomerListService(request: ExportCustomerListREQ): Promise<CustomerExportRESP> {
  return exportCustomerListAPI({ authority: CustomerListWireAuthority.NORMAL_USER, ...request });
}

export async function exportCustomerListAndGetFileService(request: ExportCustomerListREQ): Promise<CustomerExportResult> {
  const response = await exportCustomerListService(request);
  const history = response.data.history;
  const completedResult = getCompletedCustomerExportResult(history.status, history.file_path, history.file_name);
  if (completedResult) return completedResult;

  if (isFailedCustomerExportStatus(history.status)) {
    throw new Error('Export failed');
  }

  for (let attempt = 0; attempt < CUSTOMER_EXPORT_MAX_ATTEMPTS; attempt++) {
    try {
      const statusResponse = await getCustomerExportStatusService(history.id);
      const statusHistory = statusResponse.data.history;
      const result = getCompletedCustomerExportResult(statusHistory.status, statusHistory.file_path, statusHistory.file_name);
      if (result) return result;

      if (isFailedCustomerExportStatus(statusHistory.status)) {
        throw new Error('Export failed');
      }
    } catch (error) {
      if (attempt === CUSTOMER_EXPORT_MAX_ATTEMPTS - 1 && history.file_path) {
        return {
          fileUrl: history.file_path,
          fileName: history.file_name,
        };
      }

      if (attempt === CUSTOMER_EXPORT_MAX_ATTEMPTS - 1) {
        throw error;
      }
    }

    if (attempt < CUSTOMER_EXPORT_MAX_ATTEMPTS - 1) {
      await sleep(CUSTOMER_EXPORT_POLL_INTERVAL_MS);
    }
  }

  if (history.file_path) {
    return {
      fileUrl: history.file_path,
      fileName: history.file_name,
    };
  }

  throw new Error('Export timeout');
}

function getCompletedCustomerExportResult(status: string, filePath: string, fileName: string): CustomerExportResult | undefined {
  if (status.trim().toLowerCase() !== 'completed') return undefined;
  if (!filePath) throw new Error('Export completed without a file');

  return {
    fileUrl: filePath,
    fileName,
  };
}

function isFailedCustomerExportStatus(status: string) {
  return status.trim().toLowerCase() === 'failed';
}

export async function getCustomerExportStatusService(historyId: number): Promise<CustomerExportRESP> {
  return getCustomerExportStatusAPI(historyId);
}
