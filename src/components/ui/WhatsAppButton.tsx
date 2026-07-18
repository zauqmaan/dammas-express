"use client";

const WHATSAPP_URL = "https://wa.me/971566625302";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.83 14.02c-.24.68-1.4 1.33-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.3-1.63-.6-2.87-1.24-4.74-4.13-4.88-4.32-.14-.19-1.17-1.55-1.17-2.96 0-1.4.73-2.09 1-2.38.24-.27.55-.34.73-.34l.53.01c.17.01.4-.06.62.48.24.58.81 2 .88 2.14.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.02 1.11 1 2.05 1.31 2.34 1.46.29.15.46.13.63-.08.17-.2.72-.85.92-1.14.19-.29.39-.24.65-.14.27.1 1.7.81 1.99.95.29.15.48.22.55.34.07.13.07.72-.17 1.4Z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
        Chat with us
      </span>
      <button
        type="button"
        aria-label="Chat with us on WhatsApp"
        onClick={() => window.open(WHATSAPP_URL, "_blank")}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform duration-200"
      >
        <WhatsAppIcon />
      </button>
    </div>
  );
}
