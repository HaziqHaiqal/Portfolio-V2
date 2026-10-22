import type { Metadata } from 'next';
import ContactForm from '@components/Templates/teras-bina/ContactForm';
import { RevealText } from '@components/Templates/motion';
import { OFFICES } from '@components/Templates/teras-bina/data';

export const metadata: Metadata = { title: 'Contact' };

export default function TerasBinaContact() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 pt-16 md:px-8 md:pb-36 md:pt-24">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="text-5xl font-semibold leading-[1] tracking-[-0.045em] md:text-8xl">
            <RevealText text="Let's talk." />
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-tpl-muted">
            Tell us about the project. We reply within 3 working days with a
            budget estimate and our company profile.
          </p>
          <div className="mt-12 space-y-8">
            {OFFICES.map((office) => (
              <div key={office.city} className="border-t border-tpl-line pt-6">
                <p className="text-sm text-tpl-muted">{office.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {office.city}
                </p>
                <p className="mt-2 max-w-xs text-tpl-muted">{office.address}</p>
                <p className="mt-2 font-semibold">{office.phone}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
