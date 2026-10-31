import { splitPhonePattern } from '@/lib/utils';
import type { EditMemberInfoFormValues } from '@/components/ui/my/member-info/schema';
import type { FileItem } from '@/components/common';
import { UserMemberType } from '@/enums/user';
import type { ProfileUser } from './profile.response';
import type { UpdateProfileREQ, UpdatePasswordREQ } from './profile.request';

const splitEmail = (email?: string | null) => {
  if (!email) return { emailId: '', emailDomain: '' };

  const [emailId, ...rest] = email.split('@');
  return {
    emailId: emailId || '',
    emailDomain: rest.join('@') || '',
  };
};

const splitPhoneValue = (phone?: string | null) => {
  if (!phone) return { part1: '', part2: '', part3: '' };

  const result = splitPhonePattern(phone);
  return result
    ? {
        part1: result.part1,
        part2: result.part2,
        part3: result.part3,
      }
    : { part1: '', part2: '', part3: '' };
};

const getFileName = (value?: string | null) => {
  if (!value) return '';
  return value.split('/').filter(Boolean).pop() || value;
};

export const transformProfileToEditMemberInfoFormValues = (profile: ProfileUser): EditMemberInfoFormValues => {
  const mobile = splitPhoneValue(profile.mobile);
  const landline = splitPhoneValue(profile.phone);
  const email = splitEmail(profile.email);
  const customer = profile.customer;
  const bizCertificate: FileItem[] = customer?.business_registration_file
    ? [
        {
          id: 'existing-business-registration-file',
          name: getFileName(customer.business_registration_file),
          url: customer.business_registration_file,
        },
      ]
    : [];

  return {
    memberType: profile.member_type ?? UserMemberType.INDIVIDUAL,
    username: profile.username ?? '',
    password: '',
    verifyPassword: '',
    name: profile.name ?? '',
    cellphonePrefix: mobile.part1,
    cellphone1: mobile.part2,
    cellphone2: mobile.part3,
    landlinePrefix: landline.part1,
    landline1: landline.part2,
    landline2: landline.part3,
    zipCode: profile.postcode ?? '',
    address: profile.address ?? '',
    detailedAddress: profile.detailed_address ?? '',
    emailId: email.emailId,
    emailDomain: email.emailDomain,
    emailDomainSelect: 'direct',
    bizRegNumber: customer?.business_registration_number ?? '',
    companyName: customer?.company_name ?? '',
    ceoName: customer?.representative_name ?? '',
    industry: customer?.industry_type ?? '',
    bizType: customer?.business_type ?? '',
    bizZipCode: customer?.postcode ?? '',
    bizAddress: customer?.address ?? '',
    bizDetailedAddress: customer?.detailed_address ?? '',
    taxEmail: customer?.tax_invoice_email ?? '',
    homepage: customer?.homepage_url ?? '',
    bizCertificate,
  };
};

export const transformEditMemberInfoFormValuesToUpdateProfileREQ = (
  input: EditMemberInfoFormValues,
  businessRegistrationFilePath?: string,
): UpdateProfileREQ => {
  return {
    name: input.name?.trim(),
    email: input.emailId && input.emailDomain ? `${input.emailId.trim()}@${input.emailDomain.trim()}` : undefined,
    phone:
      input.landlinePrefix && input.landline1 && input.landline2
        ? `${input.landlinePrefix}${input.landline1}${input.landline2}`
        : undefined,
    mobile:
      input.cellphonePrefix && input.cellphone1 && input.cellphone2
        ? `${input.cellphonePrefix}${input.cellphone1}${input.cellphone2}`
        : undefined,
    postcode: input.zipCode?.trim(),
    address: input.address?.trim(),
    detailed_address: input.detailedAddress?.trim(),
    company_name: input.companyName?.trim(),
    business_registration_number: input.bizRegNumber?.trim(),
    representative_name: input.ceoName?.trim(),
    business_type: input.bizType?.trim(),
    industry_type: input.industry?.trim(),
    business_postcode: input.bizZipCode?.trim(),
    business_address: input.bizAddress?.trim(),
    business_detailed_address: input.bizDetailedAddress?.trim(),
    tax_invoice_email: input.taxEmail?.trim(),
    homepage_url: input.homepage?.trim(),
    business_registration_file: businessRegistrationFilePath,
  };
};

export const transformEditMemberInfoFormValuesToUpdatePasswordREQ = (
  input: EditMemberInfoFormValues,
  currentPassword?: string,
): UpdatePasswordREQ | null => {
  if (!input.password?.trim()) return null;
  if (!currentPassword) return null;

  return {
    current_password: currentPassword,
    new_password: input.password.trim(),
    new_password_confirmation: input.verifyPassword?.trim() ?? '',
  };
};
