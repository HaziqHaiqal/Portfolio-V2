import Fuse from 'fuse.js';
import {
  AUTOMATION,
  BUG_FIX_INCLUDE,
  type Bundle,
  CARE,
  CARE_YEARLY_SAVING,
  carePrice,
  type CareTier,
  CUSTOM_SYSTEM,
  includesOf,
  MOBILE_APPS,
  packageOfTemplate,
  PAYMENT_TERMS,
  SYSTEMS,
  TAKEOVER,
  WEBSITES,
} from '@constants/services';
import { SERVICE_FAQ } from '@constants/faq';
import { DEFAULT_CONTACT } from '@constants/contact';
import type { PortfolioData } from '@lib/data';
import type { WebsiteTemplate } from '@lib/supabase';
import { formatRM } from '@lib/format';

interface Topic {
  title: string;
  phrases: string[];
  answer: string;
  /** Broad topics (prices, about) lose to any specific topic in the same question. */
  general?: boolean;
}

export interface Match {
  answer: string;
  /** False when the question touched several topics; the AI should answer if it can. */
  confident: boolean;
}

const price = (bundle: Bundle) =>
  `${bundle.from ? 'from ' : ''}${formatRM(bundle.price)}`;
const costs = (bundle: Bundle) =>
  `${bundle.name} ${bundle.from ? 'starts from' : 'is'} ${formatRM(bundle.price)}`;
const both = (tier: CareTier) =>
  `${carePrice(tier)} or ${carePrice(tier, 'yearly')}`;
const yearOf = (date?: string) => (date ? date.slice(0, 4) : '');

const SYSTEM_PHRASES: Record<string, string[]> = {
  'online-store': [
    'online store',
    'ecommerce',
    'e-commerce',
    'kedai online',
    'shop online',
  ],
  'booking-system': ['booking', 'appointment', 'tempahan'],
  'qr-ordering': ['qr', 'qr ordering', 'food ordering', 'restaurant ordering'],
  inventory: ['inventory', 'stock'],
  invoicing: ['invoice', 'invoicing', 'quotation', 'e-invoice', 'myinvois'],
  hr: ['hr', 'leave', 'payroll', 'claims', 'attendance', 'cuti'],
  crm: ['crm', 'leads', 'sales pipeline'],
  tuition: ['tuition', 'tuition centre', 'training centre', 'tusyen'],
  membership: ['membership', 'member', 'loyalty'],
  rentals: ['rental', 'rent', 'sewa'],
};

const APP_PHRASES: Record<string, string[]> = {
  'info-app': ['info app', 'catalogue app'],
  'member-app': ['booking app', 'loyalty app', 'member app'],
  'ordering-app': ['ordering app', 'delivery app'],
};

const AUTOMATION_PHRASES: Record<string, string[]> = {
  reports: ['report', 'reports', 'alerts', 'daily report'],
  'whatsapp-orders': ['whatsapp orders', 'whatsapp order', 'whatsapp bot'],
  chatbot: ['chatbot', 'chat bot', 'ai chatbot'],
  approvals: ['approval', 'approvals', 'approval flow'],
};

const FAQ_PHRASES: Record<string, string[]> = {
  'How do we get started?': [
    'get started',
    'process',
    'how to order',
    'how does it work',
    'steps',
  ],
  'What do you need from me?': [
    'need from me',
    'what do you need',
    'requirements',
  ],
  'Is the domain included?': ['domain', 'domain name', '.com', '.com.my'],
  'Can I pay over time?': [
    'instalment',
    'installment',
    'pay over time',
    'pay monthly',
    'ansuran',
    'commission',
    'revenue share',
  ],
  "What if I'm not happy with the work?": [
    'not happy',
    'unhappy',
    'refund',
    'revision',
    'revisions',
  ],
  'What if I need something outside the package?': [
    'bug',
    'bug fix',
    'change request',
    'enhancement',
    'new feature',
    'extra feature',
  ],
  'Can I change things myself after launch?': [
    'myself',
    'edit it',
    'update it',
  ],
  'Who owns the finished work?': [
    'own the code',
    'ownership',
    'source code',
    'copyright',
  ],
};

function bundleTopic(bundle: Bundle, phrases: string[]): Topic {
  const addOns = (bundle.addOns ?? []).map(
    (item) =>
      `${item.name} +${formatRM(item.price)}${item.perLanguage ? ' each' : ''}`
  );
  return {
    title: bundle.name,
    phrases: [bundle.name, bundle.shortName ?? '', ...phrases].filter(Boolean),
    answer: [
      `${costs(bundle)}. ${bundle.summary}`,
      `You get: ${includesOf(bundle).join(', ')}.`,
      bundle.runningCost ? `Note: ${bundle.runningCost}.` : '',
      addOns.length ? `Want more? You can add ${addOns.join(', ')}.` : '',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

export function buildTopics(
  portfolio: PortfolioData,
  templates: WebsiteTemplate[]
): Topic[] {
  const [starter, business] = WEBSITES.bundles;
  const { profile, experience, education, skills, projects, interests } =
    portfolio;
  const name = profile?.display_name || profile?.full_name || 'Haziq';
  const email = profile?.email || DEFAULT_CONTACT.email;
  const lowest = (bundles: Bundle[]) =>
    formatRM(Math.min(...bundles.map((item) => item.price)));
  const cheapestTemplate = templates.length
    ? formatRM(Math.min(...templates.map((item) => item.price)))
    : null;
  const listOf = (items: string[]) =>
    items.length > 1
      ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
      : (items[0] ?? '');
  const current = experience.find((item) => item.is_current);
  const schools = new Map<string, string[]>();
  for (const item of education) {
    const course =
      item.field_of_study && !item.degree.includes(item.field_of_study)
        ? `${item.degree} in ${item.field_of_study}`
        : item.degree;
    schools.set(item.institution, [
      ...(schools.get(item.institution) ?? []),
      course,
    ]);
  }
  const roles = experience.map(
    (item) =>
      `${item.position} at ${item.companies?.name ?? 'a company'} (${yearOf(item.start_date)} to ${item.is_current ? 'now' : yearOf(item.end_date)})`
  );

  const topics: Topic[] = [
    {
      title: 'Prices',
      general: true,
      phrases: [
        'price',
        'pricing',
        'how much',
        'cost',
        'rate',
        'package',
        'harga',
        'berapa',
        'pakej',
      ],
      answer: [
        `Sure! Websites start at ${formatRM(starter.price)} for a one-page Starter, or ${formatRM(business.price)} for Business (up to 6 pages, and you can edit it yourself).`,
        cheapestTemplate
          ? `Ready-made templates start from ${cheapestTemplate}.`
          : '',
        `Systems start from ${formatRM(CUSTOM_SYSTEM.price)}, apps from ${lowest(MOBILE_APPS.bundles)} and automation from ${lowest(AUTOMATION.bundles)}.`,
        `Maintenance is separate, from ${carePrice(CARE.starter)}. Want a free quote? Just type whatsapp 😊`,
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      ...bundleTopic(starter, [
        'one page',
        '1 page',
        'single page',
        'landing page',
      ]),
      answer: `${bundleTopic(starter, []).answer} What it doesn't include: ${(starter.excludes ?? []).join(' or ')}. Maintenance is ${both(CARE.starter)}.`,
    },
    {
      ...bundleTopic(business, [
        'business website',
        'cms',
        'content editor',
        '6 pages',
      ]),
      answer: `${bundleTopic(business, []).answer} What it doesn't include: ${(business.excludes ?? []).join(' or ')}. Maintenance is ${both(CARE.business)}.`,
    },
    {
      title: 'Custom systems',
      phrases: [
        'customise',
        'customize',
        'custom system',
        'system',
        'systems',
        'sistem',
      ],
      answer: `Custom systems start from ${formatRM(CUSTOM_SYSTEM.price)}. Haziq can build: ${SYSTEMS.bundles.map((item) => `${item.name} (${price(item)})`).join(', ')}. Each one comes with logins, a database with daily backups and an admin dashboard. You can price out the features yourself in the estimate builder on the Services page! Maintenance is ${both(CARE.system)}.`,
    },
    ...SYSTEMS.bundles.map((item) =>
      bundleTopic(item, SYSTEM_PHRASES[item.id] ?? [])
    ),
    {
      title: 'Mobile apps',
      phrases: ['mobile app', 'app', 'android', 'ios', 'iphone', 'aplikasi'],
      answer: `Yep, Haziq builds Android and iOS apps! ${MOBILE_APPS.bundles.map((item) => `${item.name} ${price(item)}`).join(', ')}. ${MOBILE_APPS.note ?? ''} Maintenance is ${both(CARE.app)}.`,
    },
    ...MOBILE_APPS.bundles.map((item) =>
      bundleTopic(item, APP_PHRASES[item.id] ?? [])
    ),
    {
      title: 'Automation',
      phrases: ['automation', 'automate', 'automasi'],
      answer: `Automations save you a lot of busywork! ${AUTOMATION.bundles.map((item) => `${item.name} ${price(item)}`).join(', ')}. Maintenance is ${both(CARE.automation)}.`,
    },
    ...AUTOMATION.bundles.map((item) =>
      bundleTopic(item, AUTOMATION_PHRASES[item.id] ?? [])
    ),
    {
      title: 'Maintenance',
      phrases: [
        'maintenance',
        'hosting',
        'monthly',
        'yearly',
        'annual',
        'upkeep',
        'penyelenggaraan',
      ],
      answer: `Maintenance keeps everything running: hosting and SSL, updates and backups. Starter website ${both(CARE.starter)}, Business website ${both(CARE.business)}, store template ${both(CARE.store)}, systems ${both(CARE.system)}, apps ${both(CARE.app)}, automation ${both(CARE.automation)}. Paying yearly saves ${CARE_YEARLY_SAVING}%. And bug fixes on Haziq's work are free for life, plan or no plan 👍`,
    },
    {
      title: 'Looking after an existing site',
      phrases: [
        'takeover',
        'take over',
        'existing website',
        'existing system',
        'someone else',
        'wordpress',
        'shopify',
        'wix',
        'webflow',
      ],
      answer: `Yes! Haziq can look after a site or app someone else built. First there's a one-time check (${TAKEOVER.options.map((item) => `${formatRM(item.check)} for a ${item.name.toLowerCase()}`).join(', ')}): he backs everything up, reviews the code, security and speed, and gives you a fixed-price list of any issues. After that, maintenance is ${TAKEOVER.options.map((item) => `${both(item.care)} for a ${item.name.toLowerCase()}`).join(', or ')}. Works with ${TAKEOVER.platforms.join(', ')}.`,
    },
    {
      title: 'Payment',
      phrases: ['payment', 'pay', 'deposit', 'bayar', 'payment terms'],
      answer: `Payment is split in three: ${PAYMENT_TERMS}. Need to pay over time? Instalments can be arranged, just ask on WhatsApp!`,
    },
    {
      title: 'Templates',
      phrases: [
        'template',
        'templates',
        'ready made',
        'ready-made',
        'demo',
        'demos',
        'live demo',
      ],
      answer: templates.length
        ? `There are ready-made templates you can try live on the Services page: ${templates.map((item) => `${item.name} ${formatRM(item.price)} (${packageOfTemplate(item).bundle.name})`).join(', ')}. Each one gets set up with your logo, colours and content.`
        : 'There are ready-made templates you can try live on the Services page!',
    },
    {
      title: 'Contact',
      phrases: [
        'contact',
        'email',
        'phone',
        'call',
        'reach',
        'hubungi',
        'whatsapp number',
      ],
      answer: `The quickest way is WhatsApp, just type whatsapp! You can also email ${email}${profile?.phone ? ` or call ${profile.phone}` : ''}.${profile?.location ? ` Haziq's based in ${profile.location}.` : ''}`,
    },
    {
      title: 'Full name',
      phrases: ['name', 'full name', 'fullname', 'nama', 'nama penuh'],
      answer: `His full name is ${profile?.full_name || name}, but you can just call him ${name} 😊`,
    },
    {
      title: 'Age',
      phrases: ['how old', 'age', 'umur', 'born', 'birthday'],
      answer: `Haha, that's one thing I don't know 😄${profile?.years_coding ? ` What I do know: he's been coding for ${profile.years_coding}+ years.` : ''}`,
    },
    {
      title: 'Location',
      phrases: [
        'where does haziq live',
        'where haziq live',
        'where do you live',
        'where is haziq',
        'where haziq stay',
        'based',
        'located',
        'location',
        'tinggal',
        'duduk mana',
        'kat mana',
        'lokasi',
      ],
      answer: profile?.location
        ? `${name}'s based in ${profile.location}, Malaysia 📍`
        : `${name}'s based in Malaysia 📍`,
    },
    {
      title: 'Services',
      phrases: [
        'service',
        'services',
        'servis',
        'perkhidmatan',
        'offer',
        'hire',
        'what do you do',
        'what does haziq do',
        'what haziq do',
        'what can haziq do',
        'what can you do',
        'buat apa',
        'kerja apa',
      ],
      answer: `${name} builds websites (from ${formatRM(starter.price)}), custom systems like online stores, booking and HR (from ${formatRM(CUSTOM_SYSTEM.price)}), mobile apps (from ${lowest(MOBILE_APPS.bundles)}) and automations (from ${lowest(AUTOMATION.bundles)}), and looks after them after launch. Ask me about any of them, or check the Services page!`,
    },
    {
      title: 'Education',
      phrases: [
        'study',
        'studied',
        'education',
        'university',
        'degree',
        'graduate',
        'graduated',
        'belajar',
        'universiti',
        'college',
      ],
      answer: education.length
        ? `${name} did his ${[...schools].map(([institution, courses]) => `${listOf(courses)} at ${institution}`).join(', and ')} 🎓`
        : `See the About page for ${name}'s education.`,
    },
    {
      title: 'Hobbies',
      phrases: [
        'hobby',
        'hobbies',
        'interest',
        'interests',
        'free time',
        'for fun',
        'minat',
        'gaming',
        'game',
        'piano',
        'music',
        'marathon',
      ],
      answer: interests.length
        ? `Outside of work, ${name}'s into ${listOf(interests.map((item) => item.name.toLowerCase()))}!`
        : `Ask ${name} on WhatsApp, he's happy to chat!`,
    },
    {
      title: 'Availability',
      phrases: [
        'available',
        'availability',
        'busy',
        'response time',
        'how fast',
        'free to',
      ],
      answer: `${profile?.status === 'available_for_hire' ? `Yes, ${name}'s open for new projects right now! ` : ''}The quickest way to reach him is WhatsApp${profile?.response_time ? ` (${profile.response_time})` : ''}, just type whatsapp.`,
    },
    {
      title: 'Years coding',
      phrases: [
        'years of experience',
        'how many years',
        'been coding',
        'how long has haziq',
        'how long have you',
        'berapa tahun',
        'lama coding',
      ],
      answer: `${profile?.years_coding ? `${name}'s been coding for ${profile.years_coding}+ years` : `${name}'s a developer`}${current ? `, and right now he's a ${current.position} at ${current.companies?.name ?? 'a company'}` : ''}. He takes on freelance projects too!`,
    },
    {
      title: 'Timeline',
      phrases: [
        'how long to build',
        'how long does it take',
        'how long will it take',
        'how long for',
        'timeline',
        'duration',
        'turnaround',
        'deadline',
        'berapa lama siap',
        'berapa lama nak siap',
        'bila siap',
        'when can you start',
      ],
      answer: `It depends on the project, so ${name} gives you a timeline together with the quote. Just ask on WhatsApp!`,
    },
    {
      title: 'About Haziq',
      general: true,
      phrases: [
        'who is haziq',
        'about haziq',
        'about him',
        'yourself',
        'his background',
        'siapa haziq',
        'sapa haziq',
        'siapa dia',
        'introduce',
      ],
      answer: [
        `${name} is a developer${profile?.location ? ` based in ${profile.location}` : ''} 👋`,
        profile?.years_coding
          ? `He's been coding for ${profile.years_coding}+ years.`
          : '',
        current
          ? `Right now he's a ${current.position} at ${current.companies?.name ?? 'a company'}, and he takes on freelance projects too.`
          : 'He takes on freelance projects too.',
        'Ask me about his services or prices!',
      ]
        .filter(Boolean)
        .join(' '),
    },
    {
      title: 'Experience',
      phrases: [
        'experience',
        'work experience',
        'career',
        'worked',
        'company',
        'companies',
        'pengalaman',
      ],
      answer: roles.length
        ? `Here's where ${name} has worked: ${roles.join('; ')}.`
        : `See the About page for ${name}'s experience.`,
    },
    {
      title: 'Skills',
      phrases: [
        'skill',
        'skills',
        'tech stack',
        'stack',
        'technologies',
        'technology',
        'framework',
        'frameworks',
      ],
      answer: skills.length
        ? `${name} works with ${skills.map((item) => item.name).join(', ')}.`
        : 'See the About page for skills.',
    },
    {
      title: 'Projects',
      phrases: ['project', 'projects', 'portfolio', 'past work', 'case study'],
      answer: projects.length
        ? `Here are a few of ${name}'s projects: ${projects
            .slice(0, 6)
            .map((item) => `${item.title} (${item.description})`)
            .join('; ')}. You can see them all on the Projects page!`
        : 'See the Projects page.',
    },
    {
      title: 'Hoon',
      general: true,
      phrases: [
        'hoon',
        'who is hoon',
        'who are you',
        'siapa awak',
        'what are you',
        'are you a bot',
        'are you ai',
      ],
      answer:
        "Hey! I'm Hoon, Haziq's little helper bot 👋 Ask me anything about his work, services or prices. For anything else, Haziq's on WhatsApp.",
    },
    ...SERVICE_FAQ.map((item) => ({
      title: item.question,
      phrases: [item.question, ...(FAQ_PHRASES[item.question] ?? [])],
      answer: `Haziq says: ${item.answer}`,
    })),
  ];
  return topics;
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9.\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word
    )
    .join(' ');

export function createMatcher(topics: Topic[]) {
  const records = topics.flatMap((topic, index) =>
    topic.phrases.map((phrase) => ({ phrase: normalize(phrase), index }))
  );
  const fuse = new Fuse(records, {
    keys: ['phrase'],
    includeScore: true,
    threshold: 0.3,
    ignoreLocation: true,
  });

  return (question: string): Match | null => {
    const query = normalize(question);
    if (!query) return null;
    const padded = ` ${query} `;

    const hits = new Map<number, number>();
    for (const { phrase, index } of records) {
      if (!padded.includes(` ${phrase} `)) continue;
      const words = phrase.split(' ').length;
      hits.set(index, Math.max(hits.get(index) ?? 0, words));
    }
    const ranked = [...hits].sort((a, b) => b[1] - a[1]);
    const specific = ranked.filter(([index]) => !topics[index].general);
    const pool = specific.length ? specific : ranked;

    if (pool.length) {
      const [best, next] = pool;
      return {
        answer: topics[best[0]].answer,
        confident:
          (!next || next[1] < best[1]) &&
          (best[1] > 1 || query.split(' ').length <= 4),
      };
    }

    if (query.split(' ').length > 4) return null;
    const [fuzzy] = fuse.search(query);
    return fuzzy && (fuzzy.score ?? 1) <= 0.3
      ? { answer: topics[fuzzy.item.index].answer, confident: true }
      : null;
  };
}

export function buildFacts(topics: Topic[], portfolio: PortfolioData) {
  const details = portfolio.experience.map((item) =>
    [
      `${item.position} at ${item.companies?.name ?? 'a company'}`,
      ...(item.responsibilities ?? []).slice(0, 3),
    ].join(': ')
  );
  return [
    ...topics.map((topic) => `${topic.title}: ${topic.answer}`),
    details.length ? `Experience details: ${details.join(' | ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
