import { formatRM } from '@lib/format';
import {
  CARE_YEARLY_MONTHS,
  CARE_YEARLY_SAVING,
  PAYMENT_TERMS,
  TAKEOVER,
} from './services';

const [WEBSITE, SYSTEM] = TAKEOVER.options;

export const SERVICE_FAQ = [
  {
    question: 'How do we get started?',
    answer: `Pick a package or a template, or build an estimate for a system, and send it on WhatsApp. I reply with a written scope and a fixed price, free of charge. Payment is ${PAYMENT_TERMS}.`,
  },
  {
    question: 'What do you need from me?',
    answer:
      'Your logo, text and photos. If you need help with the words, copywriting can be quoted separately.',
  },
  {
    question: 'Is the domain included?',
    answer:
      'Yes, for the first year on landing pages and business websites. It is registered in your name, and from the second year it renews at cost, usually under RM100 a year for .com or .com.my. Hosting is part of maintenance, and the first year of that is included too.',
  },
  {
    question: 'What does maintenance cover?',
    answer: `Hosting, SSL, security updates, regular backups and bug fixes, so your site or app stays online. Pay yearly and ${12 - CARE_YEARLY_MONTHS} months are free (save ${CARE_YEARLY_SAVING}%), or pay monthly. Landing pages and business websites include the first year.`,
  },
  {
    question: 'Can I stop maintenance?',
    answer:
      'Yes, any time. The site or app then goes offline from my hosting, and the code is yours to host elsewhere. Bug fixes on my work stay free, with or without maintenance.',
  },
  {
    question: 'Can you look after a site or app someone else built?',
    answer: `Yes. It starts with a one-time check: ${formatRM(WEBSITE.check)} for a website, ${formatRM(SYSTEM.check)} for a system or app. I back everything up, move access into your name if needed, review the code, security and speed, and send a list of issues, each with a fixed price. If you then pay maintenance yearly, the check comes off your first year. It works for WordPress, React, Next.js and Node.js sites, React Native apps, and Wix, Shopify or Webflow (content and settings only).`,
  },
  {
    question: 'Does automation work with the tools I already use?',
    answer:
      'Yes. Each one connects to what you already use, such as WhatsApp, Google Sheets or email, and is tested with your real data before it goes live.',
  },
  {
    question: 'Can I pay over time?',
    answer:
      'Yes. Instalments can be arranged for any package, and online stores or ordering systems can pay part of the price from their sales. Ask on WhatsApp. The plan is agreed in writing before work starts.',
  },
  {
    question: "What if I'm not happy with the work?",
    answer:
      'You test everything before the final 40% is paid. Anything that does not match the agreed scope is fixed at no extra cost. New ideas beyond the scope are quoted first.',
  },
  {
    question: 'What if I need something outside the package?',
    answer:
      "Bug fixes on my work are free for life. Change requests, enhancements, new pages and features after the quote is agreed are quoted separately before work starts, and so are fixes for problems caused by someone else's changes or by other companies' services.",
  },
  {
    question: 'Can I change things myself after launch?',
    answer:
      'Business websites and Business templates come with a content editor (CMS) for your text, photos and prices. Online stores and systems come with an admin dashboard.',
  },
  {
    question: 'Why a custom system instead of a ready-made app?',
    answer:
      'Ready-made apps for POS, booking or payroll charge every month, often per staff or per outlet, and you work their way. A custom system is paid once for the build plus a fixed maintenance fee, with no per-staff or per-outlet charges. It follows how your business works, and the code and data are yours. If a ready-made app already fits you, I will tell you.',
  },
  {
    question: 'Who owns the finished work?',
    answer:
      'Your domain and app store accounts are in your name. Once the final payment is made, the code and content are yours.',
  },
];
