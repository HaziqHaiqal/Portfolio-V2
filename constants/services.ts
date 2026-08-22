const CTA_LABEL = 'Get Quote';

export type ServiceIcon = 'web' | 'mobile';

export interface Feature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  bestFor?: string;
  price: string;
  priceNote?: string;
  features: Feature[];
  note?: string;
  cta?: { label: string; href: string };
}

export interface Service {
  title: string;
  description: string;
  icon: ServiceIcon;
  price?: string;
  cta?: { label: string; href: string };
  pricingLabel?: string;
  tiers?: PricingTier[];
}

export interface ServiceGroup {
  heading: string;
  comingSoon?: boolean;
  note?: string;
  items: Service[];
}

export function getServiceGroups(whatsappHref: string): ServiceGroup[] {
  return [
    {
      heading: 'Development',
      items: [
        {
          title: 'Mobile App Development',
          description:
            'Native and cross-platform apps (Flutter, Kotlin, Java) from idea to store launch.',
          icon: 'mobile',
          price: 'Starting from RM3,000',
          cta: { label: CTA_LABEL, href: whatsappHref },
        },
        {
          title: 'Web Development',
          description:
            'Premium landing pages to full custom web platforms — payment gateways, backend logic, and everything in between.',
          icon: 'web',
          price: 'Starting from RM2,000',
          cta: { label: CTA_LABEL, href: whatsappHref },
          pricingLabel: 'Web development pricing',
          tiers: [
            {
              name: 'Landing Page',
              price: 'RM2,000',
              priceNote: 'one-time',
              features: [
                { text: 'Single premium page design', included: true },
                { text: 'Premium & modern UI/UX design', included: true },
                { text: 'Basic SEO', included: true },
                { text: 'No e-commerce', included: false },
                { text: 'No SSO / login systems', included: false },
                { text: 'No backend logic', included: false },
              ],
              cta: { label: 'Chat on WhatsApp', href: whatsappHref },
            },
            {
              name: 'Custom Web Development',
              bestFor: 'Projects that need more than a landing page.',
              price: 'Custom pricing',
              features: [
                { text: 'Payment gateway integration', included: true },
                { text: 'Authentication / SSO', included: true },
                { text: 'Custom backend & database', included: true },
                { text: 'Multi-page or web app', included: true },
                { text: 'Ongoing feature development', included: true },
              ],
              note: 'Final pricing depends on project scope and integrations.',
              cta: { label: 'Chat on WhatsApp', href: whatsappHref },
            },
          ],
        },
      ],
    },
    {
      heading: 'Coaching & Mentoring',
      comingSoon: true,
      note: '',
      items: [],
    },
  ];
}
