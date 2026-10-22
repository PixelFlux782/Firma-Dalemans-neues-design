import type { CustomerPriceMode } from "@/components/commerce/PriceDisplayProvider";

export interface InquiryContactInput {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  phone: string;
  postalCode: string;
  message: string;
  privacyAccepted: boolean;
}

export interface InquiryItemInput {
  productHandle: string;
  variantId: string;
  quantity: number;
  selectedAddons: string[];
}

export interface InquiryRequestBody {
  contact: InquiryContactInput;
  customerType: CustomerPriceMode;
  items: InquiryItemInput[];
  idempotencyKey: string;
  website: string;
}

export interface InquirySuccessResponse {
  accepted: true;
  inquiryId: string;
  customerConfirmation: "sent" | "failed";
}

export interface InquiryErrorResponse {
  accepted?: false;
  error: string;
  fieldErrors?: Partial<Record<keyof InquiryContactInput | "items", string>>;
}
