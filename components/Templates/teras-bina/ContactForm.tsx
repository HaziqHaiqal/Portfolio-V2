'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SERVICES } from './data';

const FIELD =
  'mt-1 w-full border-0 border-b border-tpl-line bg-transparent px-0 py-3 text-lg text-tpl-ink outline-none transition-colors placeholder:text-tpl-muted/60 focus:border-tpl-ink focus:ring-0';

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-start border-t border-tpl-line py-10">
        <CheckCircle2 size={40} aria-hidden="true" className="text-tpl-ink" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          Enquiry received
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-tpl-muted">
          This is a demo. On your site, enquiries go straight to your email
          inbox.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-semibold underline underline-offset-4"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
        <label className="text-sm text-tpl-muted">
          Name
          <input
            required
            name="name"
            className={FIELD}
            placeholder="Nur Aisyah"
          />
        </label>
        <label className="text-sm text-tpl-muted">
          Company
          <input name="company" className={FIELD} placeholder="Company name" />
        </label>
        <label className="text-sm text-tpl-muted">
          Email
          <input
            required
            type="email"
            name="email"
            className={FIELD}
            placeholder="you@company.com.my"
          />
        </label>
        <label className="text-sm text-tpl-muted">
          Phone
          <input
            type="tel"
            name="phone"
            className={FIELD}
            placeholder="012-345 6789"
          />
        </label>
        <label className="text-sm text-tpl-muted">
          Type of work
          <select name="service" className={FIELD} defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {SERVICES.map((service) => (
              <option key={service.id}>{service.title}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-tpl-muted">
          Estimated budget
          <select name="budget" className={FIELD} defaultValue="">
            <option value="" disabled>
              Choose a range
            </option>
            <option>Below RM5 million</option>
            <option>RM5 to 20 million</option>
            <option>RM20 to 100 million</option>
            <option>Above RM100 million</option>
          </select>
        </label>
        <label className="text-sm text-tpl-muted sm:col-span-2">
          Project details
          <textarea
            name="message"
            rows={4}
            className={FIELD}
            placeholder="Location, building type, timeline and tender date"
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-tpl-accent px-7 text-sm font-semibold text-tpl-on-accent sm:w-auto"
      >
        Send enquiry
      </button>
    </form>
  );
}
