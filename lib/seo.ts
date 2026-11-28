import type { PortfolioData } from '@lib/data';
import { SITE_URL } from '@lib/site';

export const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// Google's AI Overview split the short and full names into two people; listing every
// variant on one Person entity is what merges them.
const NAME = 'Haziq Haiqal';
const NAME_VARIANTS = [
  'Muhammad Haziq Haiqal Kamaruddin',
  'Muhammad Haziq Haiqal',
  'Haziq Haiqal Kamaruddin',
  'mhaziqhaiqal',
];

export const HOME_DESCRIPTION =
  'Portfolio of Haziq Haiqal (Muhammad Haziq Haiqal Kamaruddin), a full-stack developer in Malaysia building websites, mobile apps and automation.';

export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}

const org = (name: string, url?: string) => ({
  '@type': 'Organization',
  name,
  ...(url ? { url } : {}),
});

export function personJsonLd({
  profile,
  experience,
  education,
  skills,
}: PortfolioData) {
  const current = experience.filter((job) => job.is_current);
  const pastEmployers = [
    ...new Set(
      experience
        .filter((job) => !job.is_current && job.companies?.name)
        .map((job) => job.companies!.name)
    ),
  ];
  const schools = [...new Set(education.map((item) => item.institution))];
  const alternateName = [
    ...new Set([profile?.full_name, ...NAME_VARIANTS]),
  ].filter((name): name is string => !!name && name !== NAME);

  const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: NAME,
    alternateName,
    url: SITE_URL,
    ...(profile?.profile_image_url ? { image: profile.profile_image_url } : {}),
    jobTitle: current[0]?.position ?? profile?.subtitle ?? 'Software Developer',
    description:
      'Full-stack developer in Malaysia building websites, mobile apps and automation.',
    ...(current.length
      ? {
          worksFor: current
            .filter((job) => job.companies?.name)
            .map((job) =>
              org(job.companies!.name, job.companies!.website_url)
            ),
        }
      : {}),
    alumniOf: [
      ...schools.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
      ...pastEmployers.map((name) => org(name)),
    ],
    knowsAbout: skills
      .filter((skill) => skill.is_featured)
      .map((skill) => skill.name),
    sameAs: [profile?.linkedin_url, profile?.github_url].filter(Boolean),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: SITE_URL,
        name: NAME,
        alternateName: ['Haziq Haiqal Portfolio', 'haziqhaiqal.com'],
        publisher: { '@id': PERSON_ID },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: `${NAME} | Software Developer Portfolio`,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        ...(profile?.updated_at ? { dateModified: profile.updated_at } : {}),
      },
      person,
    ],
  };
}
