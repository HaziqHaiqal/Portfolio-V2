import Fuse from 'fuse.js';
import {
  AI_USAGE_FEES,
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
  /** Extra facts for the AI that are too long to show in the answer. */
  detail?: string;
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
const points = (items: string[]) => items.map((item) => `• ${item}`).join('\n');
const lines = (...parts: string[]) => parts.filter(Boolean).join('\n');
const listOf = (items: string[]) =>
  items.length > 1
    ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
    : (items[0] ?? '');
const gist = (text: string) =>
  text
    .split(/\s(?:with|that|which|showcasing|using)\s|,\s/)[0]
    .replace(/\.$/, '');

const SPOOKY_INTRO =
  "Hey! I'm Spooky, Haziq's little helper bot 👋 Ask me anything about his work, services or prices. For anything else, Haziq's on WhatsApp.";

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
  crm: [
    'crm',
    'leads',
    'sales pipeline',
    'sales tracking',
    'customer tracking',
  ],
  tuition: ['tuition', 'tuition centre', 'training centre', 'tusyen'],
  membership: ['membership', 'member', 'loyalty'],
  rentals: ['rental', 'rent', 'sewa'],
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
  'Why a custom system instead of a ready-made app?': [
    'ready-made app',
    'ready made app',
    'why custom',
    'subscription',
    'monthly fee',
    'saas',
    'storehub',
    'talenox',
  ],
  'Who owns the finished work?': [
    'own the code',
    'ownership',
    'source code',
    'copyright',
  ],
};

function bundleTopic(
  bundle: Bundle,
  phrases: string[],
  extra: string[] = [],
  base?: string
): Topic {
  const extras = bundle.addOns ?? [];
  const addOns = extras.map(
    (item) =>
      `${item.name} +${formatRM(item.price)}${item.perLanguage ? ' each' : ''}`
  );
  return {
    title: bundle.name,
    phrases: [bundle.name, bundle.shortName ?? '', ...phrases].filter(Boolean),
    answer: lines(
      `${costs(bundle)}. ${bundle.summary}`,
      base ? `Everything in ${base}, plus:` : 'You get:',
      points(includesOf(bundle)),
      ...extra,
      bundle.runningCost ? `Note: ${bundle.runningCost}.` : '',
      extras.length
        ? `Extras (from +${formatRM(Math.min(...extras.map((item) => item.price)))}): ${extras
            .slice(0, 3)
            .map((item) => item.name)
            .join(
              ', '
            )}${extras.length > 3 ? ' and more' : ''}. See them all on the Services page.`
        : ''
    ),
    detail: addOns.length ? `All extras: ${addOns.join(', ')}.` : undefined,
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
  const aiAddOns = SYSTEMS.bundles.flatMap((bundle) =>
    (bundle.addOns ?? [])
      .filter((item) => item.ai)
      .map((item) => ({ bundle, item }))
  );
  const assistant = aiAddOns.find(
    ({ item }) => item.id === 'ai-assistant'
  )?.item;
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
  const stack = new Map<string, string[]>();
  for (const item of [...skills].sort(
    (a, b) => Number(b.is_featured) - Number(a.is_featured)
  )) {
    stack.set(item.category, [...(stack.get(item.category) ?? []), item.name]);
  }
  const roles = experience.map(
    (item) =>
      `${item.position} at ${item.companies?.name ?? 'a company'} (${item.is_current ? `${yearOf(item.start_date)} to now` : yearOf(item.start_date) === yearOf(item.end_date) ? yearOf(item.start_date) : `${yearOf(item.start_date)} to ${yearOf(item.end_date)}`})`
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
      answer: lines(
        "Sure! Here's where prices start:",
        points([
          `Starter website (1 page): ${formatRM(starter.price)}`,
          `Business website (up to 6 pages, you edit it yourself): ${formatRM(business.price)}`,
          ...(cheapestTemplate
            ? [`Ready-made templates: from ${cheapestTemplate}`]
            : []),
          `Custom systems: from ${formatRM(CUSTOM_SYSTEM.price)}`,
          'Mobile apps: free quote per project',
          `Automation: from ${lowest(AUTOMATION.bundles)}`,
        ]),
        `Maintenance is separate, from ${carePrice(CARE.starter)}. Type whatsapp for a free quote 😊`
      ),
    },
    bundleTopic(
      starter,
      ['one page', '1 page', 'single page', 'landing page'],
      [
        `Not included: ${(starter.excludes ?? []).join(', ')}.`,
        `Maintenance: ${both(CARE.starter)}.`,
      ]
    ),
    bundleTopic(
      business,
      ['business website', 'cms', 'content editor', '6 pages'],
      [
        `Not included: ${(business.excludes ?? []).join(', ')}.`,
        `Maintenance: ${both(CARE.business)}.`,
      ],
      starter.name
    ),
    {
      title: 'Custom systems',
      phrases: [
        'customise',
        'enterprise',
        'customize',
        'custom system',
        'system',
        'systems',
        'sistem',
      ],
      answer: lines(
        `Custom systems start from ${formatRM(CUSTOM_SYSTEM.price)}. Haziq can build:`,
        points(SYSTEMS.bundles.map((item) => `${item.name}: ${price(item)}`)),
        'Each one comes with logins, daily backups and an admin dashboard. Try the estimate builder on the Services page for an exact price!'
      ),
    },
    ...SYSTEMS.bundles.map((item) =>
      bundleTopic(item, SYSTEM_PHRASES[item.id] ?? [])
    ),
    {
      title: 'AI features',
      phrases: [
        'ai',
        'ai features',
        'artificial intelligence',
        'kecerdasan buatan',
        'chatgpt',
        'gpt',
      ],
      answer: lines(
        'Yes! Every system can come with AI:',
        points(
          aiAddOns
            .filter(({ item }) => item.id !== assistant?.id)
            .map(
              ({ bundle, item }) =>
                `${bundle.shortName ?? bundle.name}: ${item.name} +${formatRM(item.price)}`
            )
        ),
        assistant
          ? `Plus an ${assistant.name} (+${formatRM(assistant.price)}) for any system: it messages you each morning on what needs attention, like "3 invoices are overdue", and answers your questions in WhatsApp or Telegram.`
          : '',
        `Someone on your team checks anything the AI reads or drafts before it's saved or sent. ${AI_USAGE_FEES}.`
      ),
    },
    {
      title: 'Mobile apps',
      phrases: [
        'mobile app',
        'app',
        'android',
        'ios',
        'iphone',
        'aplikasi',
        'loyalty app',
        'member app',
        'booking app',
        'ordering app',
        'delivery app',
        'custom app',
      ],
      answer: lines(
        'Yep, Haziq builds Android and iOS apps!',
        'Every app is different, so each one gets its own quote. It is free, with a written scope and a fixed price before any work starts. Describe your idea on the Services page or just type whatsapp.',
        MOBILE_APPS.note ?? ''
      ),
    },
    {
      title: 'Automation',
      phrases: ['automation', 'automate', 'automasi'],
      answer: lines(
        'Automations save you a lot of busywork!',
        points(
          AUTOMATION.bundles.map((item) => `${item.name}: ${price(item)}`)
        ),
        `Maintenance: ${both(CARE.automation)}.`
      ),
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
      answer: lines(
        'Maintenance covers hosting, SSL, updates and backups:',
        points([
          `Starter website: ${both(CARE.starter)}`,
          `Business website: ${both(CARE.business)}`,
          `Store template: ${both(CARE.store)}`,
          `Systems: ${both(CARE.system)}`,
          `Apps: ${both(CARE.app)}`,
          `Automation: ${both(CARE.automation)}`,
        ]),
        `Paying yearly saves ${CARE_YEARLY_SAVING}%, and bug fixes on Haziq's work are free for life 👍`
      ),
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
      answer: lines(
        'Yes! Haziq can look after a site or app someone else built. It starts with a one-time check: he backs everything up, reviews the code, security and speed, and gives you a fixed-price list of any issues.',
        points(
          TAKEOVER.options.map(
            (item) =>
              `${item.name}: ${formatRM(item.check)} check, then ${both(item.care)}`
          )
        ),
        `Works with ${TAKEOVER.platforms.join(', ')}.`
      ),
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
        ? lines(
            'You can try these ready-made templates live on the Services page:',
            points(
              templates.map(
                (item) =>
                  `${item.name}: ${formatRM(item.price)} (${packageOfTemplate(item).bundle.name})`
              )
            ),
            'Each one gets set up with your logo, colours and content.'
          )
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
      answer: lines(
        `${name} can help you with:`,
        points([
          `Websites: from ${formatRM(starter.price)}`,
          `Custom systems like online stores, booking and HR: from ${formatRM(CUSTOM_SYSTEM.price)}`,
          'Mobile apps: free quote per project',
          `Automations: from ${lowest(AUTOMATION.bundles)}`,
          `Maintenance after launch: from ${carePrice(CARE.starter)}`,
        ]),
        'Ask me about any of them!'
      ),
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
      answer: !education.length
        ? `See the About page for ${name}'s education.`
        : schools.size === 1
          ? `${name} did his ${[...schools].map(([institution, courses]) => `${listOf(courses)} at ${institution}`)[0]} 🎓`
          : lines(
              `${name} studied at:`,
              points(
                [...schools].map(
                  ([institution, courses]) =>
                    `${institution}: ${listOf(courses)}`
                )
              )
            ),
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
        ? lines(`Here's where ${name} has worked:`, points(roles))
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
        ? lines(
            `${name}'s tech stack:`,
            points(
              [...stack]
                .sort((a, b) => b[1].length - a[1].length)
                .map(([category, names]) => `${category}: ${names.join(', ')}`)
            )
          )
        : 'See the About page for skills.',
    },
    {
      title: 'Projects',
      phrases: ['project', 'projects', 'portfolio', 'past work', 'case study'],
      answer: projects.length
        ? lines(
            `Here are some of ${name}'s projects:`,
            points(
              projects
                .slice(0, 6)
                .map((item) => `${item.title}: ${gist(item.description)}`)
            ),
            'Ask me about any of them, or see the Projects page!'
          )
        : 'See the Projects page.',
    },
    {
      title: 'Spooky',
      general: true,
      phrases: [
        'spooky',
        'hi',
        'hello',
        'hey',
        'hai',
        'helo',
        'salam',
        'assalamualaikum',
        'good morning',
        'good afternoon',
        'good evening',
      ],
      answer: SPOOKY_INTRO,
    },
    // Not general, so "are you ai" beats the AI features topic.
    {
      title: 'Who Spooky is',
      phrases: [
        'who is spooky',
        'who are you',
        'siapa awak',
        'what are you',
        'are you a bot',
        'are you ai',
      ],
      answer: SPOOKY_INTRO,
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

// Questions about extras want the full list, which only the AI facts carry.
const DETAIL = /\b(?:extra|add-?on|add on|tambahan)\b/;

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
          !DETAIL.test(query) &&
          (!next || next[1] < best[1]) &&
          (best[1] > 1 || query.split(' ').length <= 4),
      };
    }

    if (query.split(' ').length > 4) return null;
    const [fuzzy] = fuse.search(query);
    if (!fuzzy || (fuzzy.score ?? 1) > 0.3) return null;
    // A typo is about as long as the word it means; "test" is not "interest".
    const { phrase } = fuzzy.item;
    const similar =
      Math.min(query.length, phrase.length) /
        Math.max(query.length, phrase.length) >=
      0.75;
    return similar
      ? { answer: topics[fuzzy.item.index].answer, confident: false }
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
  const projects = portfolio.projects.map(
    (item) => `${item.title} (${item.category}): ${item.description}`
  );
  return [
    ...topics.map(
      (topic) =>
        `${topic.title}: ${topic.answer.replace(/\n/g, ' ')}${topic.detail ? ` ${topic.detail}` : ''}`
    ),
    details.length ? `Experience details: ${details.join(' | ')}` : '',
    projects.length ? `Project details: ${projects.join(' | ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
