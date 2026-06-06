import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16 md:flex-row">
      {/* Left: value proposition */}
      <section className="flex-1">
        <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold tracking-wide text-orange-800">
          FREE GUIDE
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Get more leads — <span className="text-orange-700">on autopilot.</span>
        </h1>
        <p className="mt-4 max-w-md text-lg text-stone-600">
          Grab the free guide and we&apos;ll send you a short series of quick wins by
          email or WhatsApp. Practical, no fluff, unsubscribe anytime.
        </p>
        <ul className="mt-6 space-y-2 text-stone-700">
          <li>✅ A proven 3-message follow-up sequence</li>
          <li>✅ Works across email, WhatsApp, Facebook &amp; Instagram</li>
          <li>✅ Set it up once, capture leads 24/7</li>
        </ul>
      </section>

      {/* Right: capture form */}
      <section className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-7 shadow-lg">
        <h2 className="text-xl font-bold">Send me the free guide</h2>
        <p className="mb-5 mt-1 text-sm text-stone-500">
          Enter your email and/or WhatsApp number.
        </p>
        <LeadForm source="homepage" />
      </section>
    </main>
  );
}
