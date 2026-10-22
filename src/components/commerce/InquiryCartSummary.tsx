"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/commerce/cart/CartProvider";
import { usePriceDisplay } from "@/components/commerce/PriceDisplayProvider";
import { chairAddonBySku } from "@/lib/commerce/chair-addons";
import type { InquiryErrorResponse, InquirySuccessResponse } from "@/lib/inquiry/types";

type FieldName = "firstName" | "lastName" | "organization" | "email" | "phone" | "postalCode" | "message" | "privacyAccepted" | "items";
type FieldErrors = Partial<Record<FieldName, string>>;
const fieldOrder: FieldName[] = ["firstName", "lastName", "email", "phone", "postalCode", "privacyAccepted"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function values(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    firstName: String(data.get("firstName") ?? "").trim(),
    lastName: String(data.get("lastName") ?? "").trim(),
    organization: String(data.get("organization") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    phone: String(data.get("phone") ?? "").trim(),
    postalCode: String(data.get("postalCode") ?? "").trim(),
    message: String(data.get("message") ?? "").trim(),
    privacyAccepted: data.get("privacyAccepted") === "on",
  };
}

function validate(form: HTMLFormElement): FieldErrors {
  const input = values(form);
  const errors: FieldErrors = {};
  if (input.firstName.length < 2) errors.firstName = "Bitte geben Sie Ihren Vornamen ein.";
  if (input.lastName.length < 2) errors.lastName = "Bitte geben Sie Ihren Nachnamen ein.";
  if (!emailPattern.test(input.email)) errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
  if (input.phone && !/^[+()0-9\s./-]{5,40}$/.test(input.phone)) errors.phone = "Bitte prüfen Sie die Telefonnummer.";
  if (input.postalCode && !/^\d{5}$/.test(input.postalCode)) errors.postalCode = "Bitte geben Sie eine fünfstellige Liefer-PLZ ein.";
  if (!input.privacyAccepted) errors.privacyAccepted = "Bitte bestätigen Sie die Datenschutzhinweise.";
  return errors;
}

function FieldError({ name, errors }: { name: FieldName; errors: FieldErrors }) {
  if (!errors[name]) return null;
  return <p id={`inquiry-${name}-error`} role="alert" className="mt-2 text-sm leading-6 text-red-800">{errors[name]}</p>;
}

function invalidProps(name: FieldName, errors: FieldErrors) {
  return { "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `inquiry-${name}-error` : undefined } as const;
}

export default function InquiryCartSummary() {
  const { cart, hydrated, clearCart } = useCart();
  const { mode, setMode, formatPrice, priceLabel } = usePriceDisplay();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState<InquirySuccessResponse | null>(null);
  const idempotencyKey = useRef("");
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    idempotencyKey.current = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, []);
  useEffect(() => { if (status || success) statusRef.current?.focus(); }, [status, success]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (attempted && event.currentTarget.form) setErrors(validate(event.currentTarget.form));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const nextErrors = validate(form);
    if (!cart.lines.length) nextErrors.items = "Ihre Produktauswahl ist leer.";
    setAttempted(true);
    setErrors(nextErrors);
    setStatus(null);
    const firstInvalid = fieldOrder.find((name) => nextErrors[name]);
    if (firstInvalid || nextErrors.items) {
      window.requestAnimationFrame(() => {
        const target = firstInvalid ? form.elements.namedItem(firstInvalid) : document.getElementById("inquiry-items");
        if (target instanceof HTMLElement) target.focus();
      });
      return;
    }

    const contact = values(form);
    setPending(true);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact,
          customerType: mode,
          idempotencyKey: idempotencyKey.current,
          website: String(new FormData(form).get("website") ?? ""),
          items: cart.lines.map((line) => ({
            productHandle: line.productHandle,
            variantId: line.variantId,
            quantity: line.quantity,
            selectedAddons: line.selectedAddons ?? [],
          })),
        }),
      });
      const result = await response.json() as InquirySuccessResponse | InquiryErrorResponse;
      if (!response.ok || !("accepted" in result) || result.accepted !== true) {
        const failure = result as InquiryErrorResponse;
        if (failure.fieldErrors) setErrors(failure.fieldErrors as FieldErrors);
        throw new Error(failure.error || "Die Anfrage konnte nicht sicher angenommen werden.");
      }
      setSuccess(result);
      await clearCart();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden.");
    } finally {
      setPending(false);
    }
  }

  if (!hydrated) return <p className="premium-card p-7 text-premium-muted">Ihre Produktauswahl wird geladen …</p>;
  if (success) {
    return (
      <section ref={statusRef} tabIndex={-1} className="premium-card p-7 sm:p-10" aria-live="polite">
        <p className="section-eyebrow">Anfrage eingegangen</p>
        <h2 className="mt-4 font-display text-3xl font-medium text-premium-ink">Vielen Dank für Ihre Anfrage.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-premium-muted">Wir haben Ihre Produktauswahl unter der Anfrage-ID <strong className="text-premium-ink">{success.inquiryId}</strong> angenommen und bearbeiten sie persönlich. Es wurde keine Bestellung und keine Zahlung ausgelöst.</p>
        {success.customerConfirmation === "failed" ? <p className="mt-5 rounded-2xl border border-amber-700/25 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">Ihre Anfrage ist sicher eingegangen. Lediglich die Bestätigungs-E-Mail konnte nicht zugestellt werden; bitte notieren Sie die Anfrage-ID.</p> : <p className="mt-5 text-sm leading-6 text-premium-muted">Eine Zusammenfassung wurde an Ihre E-Mail-Adresse gesendet.</p>}
        <Link href="/produkte" className="btn-primary mt-7 inline-flex">Weitere Produkte ansehen</Link>
      </section>
    );
  }
  if (!cart.lines.length) {
    return (
      <div className="premium-card p-7 text-center sm:p-10">
        <h2 className="font-display text-3xl font-medium text-premium-ink">Ihre Produktauswahl ist leer.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-premium-muted">Wählen Sie zuerst Produkte und Ausführungen aus. Anschließend können Sie hier Ihre unverbindliche Angebotsanfrage senden.</p>
        <Link href="/produkte" className="btn-primary mt-7 inline-flex">Produkte entdecken</Link>
      </div>
    );
  }

  const inputClass = "form-input";
  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" data-testid="inquiry-form">
      <div className="space-y-7">
        <section className="premium-card p-6 sm:p-8" aria-labelledby="inquiry-contact-title">
          <p className="section-eyebrow">Ihre Kontaktdaten</p>
          <h2 id="inquiry-contact-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">Wie dürfen wir Sie erreichen?</h2>
          <fieldset className="mt-7">
            <legend className="text-sm font-semibold text-premium-charcoal">Kundenart</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-2xl border p-4 text-sm ${mode === "private" ? "border-premium-forest bg-premium-warm" : "border-premium-beige bg-white"}`}>
                <input type="radio" name="customerType" value="private" checked={mode === "private"} onChange={() => setMode("private")} className="mr-2 accent-premium-forest" />
                <strong>Privatkunde</strong><span className="mt-1 block pl-5 text-xs text-premium-muted">Preise brutto inkl. 19 % MwSt.</span>
              </label>
              <label className={`cursor-pointer rounded-2xl border p-4 text-sm ${mode === "business" ? "border-premium-forest bg-premium-warm" : "border-premium-beige bg-white"}`}>
                <input type="radio" name="customerType" value="business" checked={mode === "business"} onChange={() => setMode("business")} className="mr-2 accent-premium-forest" />
                <strong>Geschäftskunde / Organisation</strong><span className="mt-1 block pl-5 text-xs text-premium-muted">Preise netto zzgl. MwSt.</span>
              </label>
            </div>
          </fieldset>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-premium-charcoal">Vorname <span aria-hidden="true">*</span>
              <input name="firstName" autoComplete="given-name" maxLength={80} required className={inputClass} onChange={handleChange} {...invalidProps("firstName", errors)} /><FieldError name="firstName" errors={errors} />
            </label>
            <label className="block text-sm font-medium text-premium-charcoal">Nachname <span aria-hidden="true">*</span>
              <input name="lastName" autoComplete="family-name" maxLength={80} required className={inputClass} onChange={handleChange} {...invalidProps("lastName", errors)} /><FieldError name="lastName" errors={errors} />
            </label>
            <label className="block text-sm font-medium text-premium-charcoal sm:col-span-2">Gemeinde / Verein / Unternehmen <span className="font-normal text-premium-muted">(optional)</span><input name="organization" autoComplete="organization" maxLength={120} className={inputClass} /></label>
            <label className="block text-sm font-medium text-premium-charcoal">E-Mail-Adresse <span aria-hidden="true">*</span>
              <input name="email" type="email" autoComplete="email" maxLength={254} required className={inputClass} onChange={handleChange} {...invalidProps("email", errors)} /><FieldError name="email" errors={errors} />
            </label>
            <label className="block text-sm font-medium text-premium-charcoal">Telefonnummer <span className="font-normal text-premium-muted">(optional)</span>
              <input name="phone" type="tel" autoComplete="tel" maxLength={40} className={inputClass} onChange={handleChange} {...invalidProps("phone", errors)} /><FieldError name="phone" errors={errors} />
            </label>
            <label className="block text-sm font-medium text-premium-charcoal">Liefer-PLZ <span className="font-normal text-premium-muted">(optional)</span>
              <input name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={5} className={inputClass} onChange={handleChange} {...invalidProps("postalCode", errors)} /><FieldError name="postalCode" errors={errors} />
            </label>
            <label className="block text-sm font-medium text-premium-charcoal sm:col-span-2">Persönliche Nachricht <span className="font-normal text-premium-muted">(optional)</span><textarea name="message" maxLength={2000} className={`${inputClass} min-h-32 resize-y`} /></label>
          </div>
        </section>
        <section id="inquiry-items" tabIndex={-1} className="space-y-4 outline-none" aria-labelledby="inquiry-items-title">
          <div><p className="section-eyebrow">Produktauswahl</p><h2 id="inquiry-items-title" className="mt-3 font-display text-3xl font-medium text-premium-ink">Ihre Zusammenstellung</h2><FieldError name="items" errors={errors} /></div>
          {cart.lines.map((line) => {
            const tier = line.priceTiers?.find((candidate) => (candidate.minimumQuantity === null || line.quantity >= candidate.minimumQuantity) && (candidate.maximumQuantity === null || line.quantity <= candidate.maximumQuantity));
            return (
              <article key={line.id} className="premium-card p-6 sm:p-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row">
                  <div><h3 className="font-display text-2xl font-medium text-premium-ink">{line.productTitle}</h3><p className="mt-2 text-sm font-medium text-premium-charcoal">{line.variantTitle}</p><p className="mt-1 text-xs text-premium-subtle">Artikelnummer: {line.erpArticleNumber ?? "nicht hinterlegt"}</p>{line.selectedAddons?.length ? <p className="mt-3 text-xs leading-5 text-premium-muted">Ausstattung: {line.selectedAddons.map((sku) => `${chairAddonBySku(sku)?.name ?? sku} (${sku})`).join(", ")}</p> : null}</div>
                  <dl className="shrink-0 space-y-2 text-sm sm:min-w-56 sm:text-right"><div><dt className="inline text-premium-muted">Menge: </dt><dd className="inline font-semibold text-premium-ink">{line.quantity} {line.unitLabel}</dd></div><div><dt className="inline text-premium-muted">Mengenstaffel: </dt><dd className="inline font-semibold text-premium-ink">{tier?.label ?? `ab ${line.minimumQuantity} ${line.unitLabel}`}</dd></div><div><dt className="inline text-premium-muted">Stückpreis: </dt><dd className="inline font-semibold text-premium-ink">{line.unitPrice ? formatPrice(line.unitPrice) : "nicht berechenbar"}</dd></div><div><dt className="inline text-premium-muted">Positionssumme: </dt><dd className="inline font-semibold text-premium-ink">{line.lineTotal ? formatPrice(line.lineTotal) : "nicht berechenbar"}</dd></div></dl>
                </div>
              </article>
            );
          })}
        </section>
      </div>
      <aside className="h-fit rounded-[1.75rem] border border-premium-beige/70 bg-premium-warm/80 p-6 lg:sticky lg:top-6">
        <p className="section-eyebrow">Anfrage prüfen</p>
        <dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt>Positionen</dt><dd className="font-semibold">{cart.lines.length}</dd></div><div className="flex justify-between gap-4"><dt>Gesamtmenge</dt><dd className="font-semibold">{cart.totalQuantity}</dd></div><div className="flex justify-between gap-4 text-base"><dt>Gesamtsumme</dt><dd className="font-semibold text-right">{cart.totals.subtotalAmount ? formatPrice(cart.totals.subtotalAmount) : "Nicht berechenbar"}</dd></div><div className="flex justify-between gap-4 text-xs text-premium-muted"><dt>Preisdarstellung</dt><dd className="text-right">{priceLabel}</dd></div></dl>
        <label className="mt-6 flex items-start gap-3 border-t border-premium-beige pt-5 text-sm leading-6 text-premium-charcoal"><input name="privacyAccepted" type="checkbox" required onChange={handleChange} className="mt-1 h-4 w-4 shrink-0 accent-premium-forest" {...invalidProps("privacyAccepted", errors)} /><span>Ich habe die <Link href="/datenschutz" target="_blank" className="underline underline-offset-4">Datenschutzhinweise</Link> zur Verarbeitung meiner Anfrage zur Kenntnis genommen. <span aria-hidden="true">*</span></span></label>
        <FieldError name="privacyAccepted" errors={errors} />
        <label className="absolute -left-[9999px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <p className="mt-5 text-sm leading-6 text-premium-muted">Mit dem Absenden bitten Sie um ein persönliches Angebot. Es wird keine zahlungspflichtige Bestellung ausgelöst.</p>
        <p className="mt-3 text-sm font-semibold text-premium-forest">Keine verbindliche Bestellung</p>
        <button type="submit" disabled={pending} className="btn-primary mt-6 w-full disabled:cursor-wait disabled:opacity-60">{pending ? "Anfrage wird sicher gesendet …" : "Unverbindliche Anfrage senden →"}</button>
        {status ? <div ref={statusRef} tabIndex={-1} role="alert" className="mt-5 rounded-2xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">{status}</div> : null}
      </aside>
    </form>
  );
}
