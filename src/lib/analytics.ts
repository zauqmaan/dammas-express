// Thin wrapper over gtag so call sites don't have to guard for "is GA loaded".
//
// Every helper is a no-op when NEXT_PUBLIC_GA_ID is unset or the script hasn't
// finished loading, so tracking calls are safe to place anywhere — including in
// local dev where no measurement ID is configured.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: GtagParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/**
 * Fired when the booking/quote form is submitted. This is the conversion to
 * mark as a key event in GA4 — it's what tells calls and form submissions apart
 * from plain visits.
 */
export function trackLead(serviceType: string): void {
  trackEvent("generate_lead", { service_type: serviceType });
}

/** Fired on tel: / WhatsApp clicks — the other way customers actually convert. */
export function trackContactClick(method: "phone" | "whatsapp" | "email", location: string): void {
  trackEvent("contact_click", { method, link_location: location });
}
