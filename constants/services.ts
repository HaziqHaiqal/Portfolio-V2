const CTA_LABEL = 'Get Quote';

export type ServiceIcon = 'web' | 'mobile' | 'automation';

export interface PricingTier {
  name: string;
  description: string;
  features: string[];
  exclusions?: string[];
  /** Examples of what this tier can include, shown in a popover on the card. */
  examples?: string[];
  price: string;
  priceNote?: string;
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
  const contact = (message: string) => {
    const url = new URL(whatsappHref);
    url.searchParams.set('text', message);
    return url.toString();
  };
  return [
    {
      heading: 'Build',
      items: [
        {
          title: 'Mobile App Development',
          description:
            'Mobile apps for Android and iPhone, designed around your business needs — from the initial idea to app store submission.',
          icon: 'mobile',
          price: 'Starting from RM3,000',
          cta: {
            label: CTA_LABEL,
            href: contact(
              "Hi Haziq, I'd like a quote for a mobile app project."
            ),
          },
        },
        {
          title: 'Web Development',
          description:
            'From your first business website to a fully custom platform. Choose a simple start or something built around your needs.',
          icon: 'web',
          price: 'Starting from RM600',
          cta: {
            label: CTA_LABEL,
            href: contact(
              "Hi Haziq, I'd like to discuss a website project. Could you help me choose a package?"
            ),
          },
          pricingLabel: 'Website packages & pricing',
          tiers: [
            {
              name: 'Rahmah',
              description:
                'A simple landing page to introduce your business and help customers get in touch.',
              features: [
                'Single-page website',
                'Simple UI design',
                'WhatsApp or email enquiry button',
                '1 month of free post-launch bug fixes',
              ],
              exclusions: [
                'No e-commerce',
                'No user authentication',
                'No database or backend logic',
              ],
              price: 'RM600',
              priceNote: 'one-time',
              cta: {
                label: 'Choose Rahmah',
                href: contact(
                  "Hi Haziq, I'm interested in the Rahmah package (RM600) for a simple landing page. Can we discuss my business website?"
                ),
              },
            },
            {
              name: 'Premium',
              description:
                'A landing page with a distinctive design and subtle animations to showcase your brand.',
              features: [
                'Single-page website',
                'Detailed UI design',
                'Animations and interactive effects',
                'WhatsApp or email enquiry button',
                '2 months of free post-launch bug fixes',
              ],
              exclusions: ['Same exclusions as Rahmah'],
              price: 'RM1,500',
              priceNote: 'one-time',
              cta: {
                label: 'Choose Premium',
                href: contact(
                  "Hi Haziq, I'm interested in the Premium package (RM1,500) for a custom landing page. Can we discuss my ideas?"
                ),
              },
            },
            {
              name: 'Exclusive',
              description:
                'For websites that need multiple pages, customer accounts, payments, an online store, or custom functionality.',
              features: [
                'Multi-page website',
                'User registration and login',
                'Payment gateway integration',
                'Database integration and custom backend logic',
                '3 months of free post-launch bug fixes',
              ],
              examples: [
                'Online store with product catalogue, cart and checkout',
                'Chatbot on your website, WhatsApp or Telegram, including AI assistants that answer customer questions',
                'Booking and appointment system with automatic reminders',
                'Customer portal for documents, invoices and progress updates',
                'Admin dashboard to manage content, orders and customers',
                'Multilingual website in the languages your customers use',
              ],
              price: 'Custom quote',
              cta: {
                label: 'Discuss Exclusive',
                href: contact(
                  "Hi Haziq, I'm interested in the Exclusive package. I'd like to discuss my requirements and get a custom quote."
                ),
              },
            },
          ],
        },
      ],
    },
    {
      heading: 'Automate',
      items: [
        {
          title: 'Business Automation',
          description:
            'Take repetitive work off your plate: chatbots for your website, WhatsApp or Telegram, approval flows for leave and claims, automated forms and spreadsheets, and reports that send themselves.',
          icon: 'automation',
          cta: {
            label: CTA_LABEL,
            href: contact(
              "Hi Haziq, I'd like to automate part of my business. Can we discuss what's possible?"
            ),
          },
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
