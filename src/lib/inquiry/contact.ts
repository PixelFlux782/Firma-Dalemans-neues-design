import type { InquiryContactInput } from "./types";

export const addressFields = [
  ["firstName", "Vorname", 80, "given-name"],
  ["lastName", "Nachname", 80, "family-name"],
  ["street", "Straße", 120, "address-line1"],
  ["houseNumber", "Hausnummer", 20, "address-line2"],
  ["postalCode", "PLZ", 20, "postal-code"],
  ["city", "Ort", 120, "address-level2"],
] as const;
export const deliveryFields = ["deliveryFirstName", "deliveryLastName", "deliveryStreet", "deliveryHouseNumber", "deliveryPostalCode", "deliveryCity"] as const;
export type ContactErrors = Partial<Record<keyof InquiryContactInput, string>>;

/** Shared browser/server normalization and validation. Disabled delivery data is discarded. */
export function parseInquiryContact(raw: Record<string, unknown>): { contact: InquiryContactInput; errors: ContactErrors } {
  const errors: ContactErrors = {};
  const differentDeliveryAddress = raw.differentDeliveryAddress === true;
  const contact = { differentDeliveryAddress, privacyAccepted: raw.privacyAccepted === true } as InquiryContactInput;
  function read(field: keyof InquiryContactInput, label: string, maximum: number, required = false, multiline = false) {
    const value = typeof raw[field] === "string" ? raw[field].trim() : "";
    const cleaned = multiline ? value : value.replace(/[\r\n\t]+/g, " ");
    Object.assign(contact, { [field]: cleaned });
    if (required && !/[\p{L}\p{N}]/u.test(cleaned)) errors[field] = `Bitte geben Sie ${label} ein.`;
    if (value.length > maximum) errors[field] = `Bitte verwenden Sie höchstens ${maximum} Zeichen.`;
  }
  addressFields.forEach(([field, label, maximum], index) => {
    read(field, label, maximum, true);
    const deliveryField = deliveryFields[index];
    if (differentDeliveryAddress) read(deliveryField, label, maximum, true);
    else Object.assign(contact, { [deliveryField]: "" });
  });
  read("organization", "Organisation", 120);
  read("email", "E-Mail-Adresse", 254);
  contact.email = contact.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
  read("phone", "Telefonnummer", 40);
  if (contact.phone && !/^[+()0-9\s./-]{5,40}$/.test(contact.phone)) errors.phone = "Bitte prüfen Sie die Telefonnummer.";
  read("message", "Nachricht", 2000, false, true);
  if (!contact.privacyAccepted) errors.privacyAccepted = "Bitte bestätigen Sie die Datenschutzhinweise.";
  return { contact, errors };
}
