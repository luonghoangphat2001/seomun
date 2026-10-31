export interface MyAccountCertificateRESP {
  account_holder: string;
  bank_code: string;
  account_number: string;
  issued_at: string;
}

export interface MyAccountCertificateDetailRESP {
  certificate: MyAccountCertificateRESP | null;
}
