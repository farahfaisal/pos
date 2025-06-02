export interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  vat: string;
  website: string;
  logo?: string;
}

export interface ReceiptSettings {
  showLogo: boolean;
  showVAT: boolean;
  showAddress: boolean;
  showPhone: boolean;
  footerText: string;
  receiptCopies: number;
}

export interface LocalizationSettings {
  language: string;
  currency: string;
  dateFormat: string;
  timezone: string;
}

export interface Settings {
  store: StoreSettings;
  receipt: ReceiptSettings;
  localization: LocalizationSettings;
}