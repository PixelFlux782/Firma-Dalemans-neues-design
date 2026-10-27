import "server-only";

import { createHash, randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { cartLineFromProduct, cartQuantityRules } from "@/lib/commerce/cart/lines";
import { chairAddonBySku, isChairAddonCompatible } from "@/lib/commerce/chair-addons";
import { getProductByHandle } from "@/lib/commerce/service";
import type { CommerceMoney, CommercePriceTier } from "@/lib/commerce/types";
import type {
  InquiryContactInput,
  InquiryItemInput,
  InquiryRequestBody,
  InquirySuccessResponse,
} from "@/lib/inquiry/types";

const MAX_ITEMS = 50;
const MAX_QUANTITY = 100_000;
const VAT_RATE = 0.19;

export class InquiryInputError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanSingleLine(value: unknown, maxLength: number) {
  return cleanString(value, maxLength).replace(/[\r\n\t]+/g, " ");
}

export function validateInquiryBody(value: unknown): InquiryRequestBody {
  if (!value || typeof value !== "object") {
    throw new InquiryInputError("Die Anfrage konnte nicht gelesen werden.");
  }

  const body = value as Record<string, unknown>;
  const rawContact = body.contact && typeof body.contact === "object"
    ? body.contact as Record<string, unknown>
    : {};
  const contact: InquiryContactInput = {
    firstName: cleanSingleLine(rawContact.firstName, 80),
    lastName: cleanSingleLine(rawContact.lastName, 80),
    organization: cleanSingleLine(rawContact.organization, 120),
    email: cleanSingleLine(rawContact.email, 254).toLowerCase(),
    phone: cleanSingleLine(rawContact.phone, 40),
    postalCode: cleanSingleLine(rawContact.postalCode, 10),
    message: cleanString(rawContact.message, 2_000),
    privacyAccepted: rawContact.privacyAccepted === true,
  };
  const fieldErrors: Record<string, string> = {};

  const maximumLengths: Array<[keyof InquiryContactInput, number]> = [
    ["firstName", 80], ["lastName", 80], ["organization", 120], ["email", 254],
    ["phone", 40], ["postalCode", 10], ["message", 2_000],
  ];
  for (const [field, maximum] of maximumLengths) {
    if (typeof rawContact[field] === "string" && rawContact[field].length > maximum) {
      fieldErrors[field] = `Bitte verwenden Sie höchstens ${maximum} Zeichen.`;
    }
  }

  if (contact.firstName.length < 2) fieldErrors.firstName = "Bitte geben Sie Ihren Vornamen ein.";
  if (contact.lastName.length < 2) fieldErrors.lastName = "Bitte geben Sie Ihren Nachnamen ein.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    fieldErrors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
  }
  if (contact.phone && !/^[+()0-9\s./-]{5,40}$/.test(contact.phone)) {
    fieldErrors.phone = "Bitte prüfen Sie die Telefonnummer.";
  }
  if (contact.postalCode && !/^\d{5}$/.test(contact.postalCode)) {
    fieldErrors.postalCode = "Bitte geben Sie eine fünfstellige Liefer-PLZ ein.";
  }
  if (!contact.privacyAccepted) {
    fieldErrors.privacyAccepted = "Bitte bestätigen Sie die Datenschutzhinweise.";
  }

  const customerType = body.customerType === "private" || body.customerType === "business"
    ? body.customerType
    : null;
  if (!customerType) fieldErrors.customerType = "Bitte wählen Sie eine Kundenart.";

  const idempotencyKey = cleanString(body.idempotencyKey, 100);
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey)) {
    fieldErrors.idempotencyKey = "Die Anfragekennung ist ungültig. Bitte laden Sie die Seite neu.";
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length < 1 || rawItems.length > MAX_ITEMS) {
    fieldErrors.items = rawItems.length < 1
      ? "Ihre Produktauswahl ist leer."
      : `Es können höchstens ${MAX_ITEMS} Positionen angefragt werden.`;
  }

  const items: InquiryItemInput[] = rawItems.slice(0, MAX_ITEMS).map((raw) => {
    const item = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    return {
      productHandle: cleanString(item.productHandle, 160),
      variantId: cleanString(item.variantId, 240),
      quantity: typeof item.quantity === "number" ? item.quantity : Number.NaN,
      selectedAddons: Array.isArray(item.selectedAddons)
        ? item.selectedAddons.map((entry) => cleanString(entry, 80)).filter(Boolean).slice(0, 20)
        : [],
    };
  });

  if (items.some((item) => !item.productHandle || !item.variantId
    || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY)) {
    fieldErrors.items = "Mindestens eine Produktposition enthält ungültige Angaben.";
  }

  if (Object.keys(fieldErrors).length || !customerType) {
    throw new InquiryInputError("Bitte prüfen Sie Ihre Angaben.", fieldErrors);
  }

  return {
    contact,
    customerType,
    items,
    idempotencyKey,
    website: cleanString(body.website, 200),
  };
}

export interface ResolvedInquiryLine {
  productName: string;
  articleNumber: string;
  variant: string;
  options: string[];
  addons: string[];
  quantity: number;
  unitLabel: string;
  tier: string;
  unitNet: CommerceMoney;
  totalNet: CommerceMoney;
}

function matchingTier(tiers: CommercePriceTier[] | undefined, quantity: number) {
  return tiers?.find((tier) =>
    (tier.minimumQuantity === null || quantity >= tier.minimumQuantity)
      && (tier.maximumQuantity === null || quantity <= tier.maximumQuantity));
}

export async function resolveInquiryItems(items: InquiryItemInput[]) {
  const resolved: ResolvedInquiryLine[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const product = await getProductByHandle(item.productHandle);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    if (!product || !variant) {
      throw new InquiryInputError("Eine ausgewählte Produktkonfiguration ist nicht mehr verfügbar.", {
        items: "Bitte prüfen Sie die Produktauswahl und versuchen Sie es erneut.",
      });
    }
    if (variant.priceDataStatus !== "verified" || !variant.price
      || variant.priceStatus === "unavailable" || variant.availability === "out_of_stock") {
      throw new InquiryInputError("Eine Position kann serverseitig nicht zuverlässig berechnet werden.", {
        items: `${product.title}: Bitte lassen Sie diese Konfiguration persönlich prüfen.`,
      });
    }

    const rules = cartQuantityRules(product, variant);
    if (item.quantity < rules.minimumQuantity
      || (item.quantity - rules.minimumQuantity) % rules.quantityStep !== 0) {
      throw new InquiryInputError("Eine Produktmenge entspricht nicht den zulässigen Mengenschritten.", {
        items: `${product.title}: Mindestmenge ${rules.minimumQuantity}, Schrittweite ${rules.quantityStep}.`,
      });
    }

    const uniqueAddonSkus = [...new Set(item.selectedAddons)].sort();
    if (uniqueAddonSkus.length !== item.selectedAddons.length) {
      throw new InquiryInputError("Eine Ausstattung wurde mehrfach übermittelt.", { items: product.title });
    }
    for (const sku of uniqueAddonSkus) {
      const addon = chairAddonBySku(sku);
      if (!addon || !product.stackingChair
        || !isChairAddonCompatible(addon, product.stackingChair.modelCode, variant)) {
        throw new InquiryInputError("Eine gewählte Ausstattung ist für diese Variante nicht zulässig.", {
          items: product.title,
        });
      }
    }

    const signature = `${product.handle}\0${variant.id}\0${uniqueAddonSkus.join(",")}`;
    if (seen.has(signature)) {
      throw new InquiryInputError("Eine identische Produktkonfiguration ist mehrfach enthalten.", {
        items: "Bitte fassen Sie identische Positionen im Warenkorb zusammen.",
      });
    }
    seen.add(signature);

    const trusted = cartLineFromProduct({
      product,
      variant,
      quantity: item.quantity,
      selectedAddonSkus: uniqueAddonSkus,
    });
    if (!trusted.unitPrice || trusted.unitPrice.currencyCode !== "EUR") {
      throw new InquiryInputError("Eine Position kann serverseitig nicht zuverlässig berechnet werden.", {
        items: product.title,
      });
    }
    const totalNet = {
      amount: (Number(trusted.unitPrice.amount) * item.quantity).toFixed(2),
      currencyCode: "EUR",
    };
    const tier = matchingTier(trusted.priceTiers, item.quantity);
    resolved.push({
      productName: product.title,
      articleNumber: variant.erpArticleNumber ?? variant.sku ?? "nicht hinterlegt",
      variant: variant.title,
      options: variant.selectedOptions.map((option) => `${option.name}: ${option.value}`),
      addons: uniqueAddonSkus.map((sku) => `${chairAddonBySku(sku)!.name} (${sku})`),
      quantity: item.quantity,
      unitLabel: product.quantity.unitLabel,
      tier: tier?.label ?? `ab ${rules.minimumQuantity} ${product.quantity.unitLabel}`,
      unitNet: trusted.unitPrice,
      totalNet,
    });
  }

  return resolved;
}

function euro(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}

function displayed(amount: number, customerType: InquiryRequestBody["customerType"]) {
  return customerType === "private" ? amount * (1 + VAT_RATE) : amount;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]!);
}

function lineText(line: ResolvedInquiryLine, customerType: InquiryRequestBody["customerType"]) {
  const priceSuffix = customerType === "private" ? "brutto inkl. 19 % MwSt." : "netto zzgl. 19 % MwSt.";
  return [
    `${line.productName} — ${line.variant}`,
    `Artikelnummer: ${line.articleNumber}`,
    ...(line.options.length ? [`Ausführung: ${line.options.join(", ")}`] : []),
    ...(line.addons.length ? [`Ausstattung: ${line.addons.join(", ")}`] : []),
    `Menge: ${line.quantity} ${line.unitLabel}`,
    `Mengenstaffel: ${line.tier}`,
    `Stückpreis: ${euro(displayed(Number(line.unitNet.amount), customerType))} ${priceSuffix}`,
    `Positionssumme: ${euro(displayed(Number(line.totalNet.amount), customerType))} ${priceSuffix}`,
  ].join("\n");
}

function totals(lines: ResolvedInquiryLine[]) {
  const net = lines.reduce((sum, line) => sum + Number(line.totalNet.amount), 0);
  const vat = net * VAT_RATE;
  return { net, vat, gross: net + vat };
}

function linesHtml(lines: ResolvedInquiryLine[], customerType: InquiryRequestBody["customerType"]) {
  const suffix = customerType === "private" ? "brutto" : "netto";
  return lines.map((line) => `
    <div style="padding:18px 0;border-bottom:1px solid #ddd7c8">
      <h3 style="margin:0 0 8px;color:#18382a">${escapeHtml(line.productName)}</h3>
      <p style="margin:0 0 4px"><strong>${escapeHtml(line.variant)}</strong></p>
      <p style="margin:0 0 4px">Artikelnummer: ${escapeHtml(line.articleNumber)}</p>
      ${line.options.length ? `<p style="margin:0 0 4px">Ausführung: ${escapeHtml(line.options.join(", "))}</p>` : ""}
      ${line.addons.length ? `<p style="margin:0 0 4px">Ausstattung: ${escapeHtml(line.addons.join(", "))}</p>` : ""}
      <p style="margin:0 0 4px">Menge: ${line.quantity} ${escapeHtml(line.unitLabel)} · Staffel: ${escapeHtml(line.tier)}</p>
      <p style="margin:0">Stückpreis: ${euro(displayed(Number(line.unitNet.amount), customerType))} ${suffix} · <strong>Position: ${euro(displayed(Number(line.totalNet.amount), customerType))} ${suffix}</strong></p>
    </div>`).join("");
}

function emailDocument(title: string, content: string) {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f4f1e9;color:#26332d;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:28px"><div style="background:#fff;padding:28px;border-radius:18px"><p style="margin:0 0 8px;color:#8a6844;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Dalemans Sitzmöbel &amp; Tische</p><h1 style="margin:0 0 24px;color:#18382a;font-size:26px">${escapeHtml(title)}</h1>${content}</div></div></body></html>`;
}

function smtpConfig() {
  const required = [
    "CONTACT_SMTP_HOST", "CONTACT_SMTP_PORT", "CONTACT_SMTP_USER",
    "CONTACT_SMTP_PASSWORD", "CONTACT_FROM_EMAIL",
  ] as const;
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) throw new Error("MAIL_NOT_CONFIGURED");
  const port = Number(process.env.CONTACT_SMTP_PORT);
  const secureValue = process.env.CONTACT_SMTP_SECURE;
  if (!Number.isInteger(port) || port < 1 || port > 65_535
    || !["true", "false"].includes(secureValue ?? "")) throw new Error("MAIL_NOT_CONFIGURED");

  const testMode = process.env.INQUIRY_MAIL_TEST_MODE === "true";
  const testRecipient = process.env.INQUIRY_TEST_TO_EMAIL?.trim();
  if (testMode && !testRecipient) throw new Error("MAIL_TEST_RECIPIENT_MISSING");
  const from = process.env.CONTACT_FROM_EMAIL!.trim();
  const internalTo = testMode ? testRecipient! : (process.env.INQUIRY_TO_EMAIL?.trim() || "info@dalemans.de");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(from) || !emailPattern.test(internalTo)) throw new Error("MAIL_NOT_CONFIGURED");
  return {
    from,
    internalTo,
    customerTo: (email: string) => testMode ? testRecipient! : email,
    transporter: nodemailer.createTransport({
      host: process.env.CONTACT_SMTP_HOST,
      port,
      secure: secureValue === "true",
      auth: { user: process.env.CONTACT_SMTP_USER, pass: process.env.CONTACT_SMTP_PASSWORD },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }),
  };
}

export function createInquiryId(now = new Date()) {
  return `DLMNS-${now.getFullYear()}-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export function idempotencyDigest(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function deliverInquiry(
  body: InquiryRequestBody,
  lines: ResolvedInquiryLine[],
  inquiryId = createInquiryId(),
): Promise<InquirySuccessResponse> {
  const mail = smtpConfig();
  const date = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin",
  }).format(new Date());
  const summary = totals(lines);
  const priceLabel = body.customerType === "private" ? "brutto inkl. 19 % MwSt." : "netto zzgl. 19 % MwSt.";
  const contactText = [
    `Name: ${body.contact.firstName} ${body.contact.lastName}`,
    `Kundenart: ${body.customerType === "private" ? "Privatkunde" : "Geschäftskunde / Organisation"}`,
    `E-Mail: ${body.contact.email}`,
    `Telefon: ${body.contact.phone || "nicht angegeben"}`,
    `Organisation: ${body.contact.organization || "nicht angegeben"}`,
    `Liefer-PLZ: ${body.contact.postalCode || "nicht angegeben"}`,
  ].join("\n");
  const totalText = [
    `Nettowarenwert: ${euro(summary.net)}`,
    `Umsatzsteuer (19 %): ${euro(summary.vat)}`,
    `Bruttowarenwert: ${euro(summary.gross)}`,
    `Dargestellte Preise: ${priceLabel}`,
  ].join("\n");
  const messageIdDomain = mail.from.split("@")[1]?.replace(/[>\s]/g, "") || "dalemans.de";
  const messageBase = idempotencyDigest(body.idempotencyKey).slice(0, 32);

  const internalInfo = await mail.transporter.sendMail({
    from: mail.from,
    to: mail.internalTo,
    replyTo: body.contact.email,
    messageId: `<inquiry-${messageBase}@${messageIdDomain}>`,
    subject: `Neue Angebotsanfrage ${inquiryId} – ${body.contact.firstName} ${body.contact.lastName}`,
    text: [
      `Anfrage-ID: ${inquiryId}`, `Datum: ${date}`, "", contactText,
      "", `Persönliche Nachricht:\n${body.contact.message || "keine Nachricht"}`,
      "", "Produktauswahl", "", lines.map((line) => lineText(line, body.customerType)).join("\n\n"),
      "", totalText, "", "Unverbindliche Angebotsanfrage – keine Bestellung und keine Zahlungsverpflichtung.",
    ].join("\n"),
    html: emailDocument(`Neue Angebotsanfrage ${inquiryId}`, `
      <p><strong>Datum:</strong> ${escapeHtml(date)}</p>
      <p>${escapeHtml(contactText).replace(/\n/g, "<br>")}</p>
      <h2 style="color:#18382a;font-size:19px">Persönliche Nachricht</h2>
      <p style="white-space:pre-wrap">${escapeHtml(body.contact.message || "keine Nachricht")}</p>
      <h2 style="color:#18382a;font-size:19px">Produktauswahl</h2>${linesHtml(lines, body.customerType)}
      <p style="line-height:1.7"><strong>Nettowarenwert:</strong> ${euro(summary.net)}<br><strong>Umsatzsteuer (19 %):</strong> ${euro(summary.vat)}<br><strong>Bruttowarenwert:</strong> ${euro(summary.gross)}<br>Dargestellte Preise: ${escapeHtml(priceLabel)}</p>
      <p style="padding:14px;background:#f4f1e9"><strong>Unverbindliche Angebotsanfrage.</strong> Es wurde keine Bestellung und keine Zahlung ausgelöst.</p>`),
  });
  if (!internalInfo.accepted?.length) throw new Error("INTERNAL_MAIL_NOT_ACCEPTED");

  let customerConfirmation: "sent" | "failed" = "sent";
  try {
    const customerInfo = await mail.transporter.sendMail({
      from: mail.from,
      to: mail.customerTo(body.contact.email),
      replyTo: mail.internalTo,
      messageId: `<confirmation-${messageBase}@${messageIdDomain}>`,
      subject: `Ihre Anfrage bei Dalemans – ${inquiryId}`,
      text: [
        `Guten Tag ${body.contact.firstName} ${body.contact.lastName},`, "",
        "vielen Dank für Ihre Anfrage. Wir bearbeiten Ihre Produktauswahl persönlich.",
        `Ihre Anfrage-ID: ${inquiryId}`, "", "Zusammenfassung", "",
        lines.map((line) => lineText(line, body.customerType)).join("\n\n"), "", totalText, "",
        "Dies ist eine Eingangsbestätigung. Ihre Anfrage ist keine Bestellung und löst keine Zahlungsverpflichtung aus.",
        "", "Dalemans Sitzmöbel & Tische", "E-Mail: info@dalemans.de",
      ].join("\n"),
      html: emailDocument(`Vielen Dank für Ihre Anfrage`, `
        <p>Guten Tag ${escapeHtml(body.contact.firstName)} ${escapeHtml(body.contact.lastName)},</p>
        <p>wir haben Ihre Anfrage erhalten und bearbeiten Ihre Produktauswahl persönlich.</p>
        <p><strong>Ihre Anfrage-ID: ${escapeHtml(inquiryId)}</strong></p>
        <h2 style="color:#18382a;font-size:19px">Zusammenfassung</h2>${linesHtml(lines, body.customerType)}
        <p style="line-height:1.7"><strong>Nettowarenwert:</strong> ${euro(summary.net)}<br><strong>Umsatzsteuer (19 %):</strong> ${euro(summary.vat)}<br><strong>Bruttowarenwert:</strong> ${euro(summary.gross)}</p>
        <p style="padding:14px;background:#f4f1e9"><strong>Dies ist keine Bestellung.</strong> Die Anfrage löst keine Zahlungsverpflichtung aus.</p>
        <p>Dalemans Sitzmöbel &amp; Tische<br><a href="mailto:info@dalemans.de">info@dalemans.de</a></p>`),
    });
    if (!customerInfo.accepted?.length) customerConfirmation = "failed";
  } catch {
    customerConfirmation = "failed";
  }

  return { accepted: true, inquiryId, customerConfirmation };
}
