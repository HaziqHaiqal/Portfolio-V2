// Used only when `profile` hasn't loaded yet or the row is missing — the
// database (profile.email / .github_url / .linkedin_url / .whatsapp_url) is the
// source of truth whenever it's available.
export const DEFAULT_CONTACT = {
  email: 'woodyz.dev@gmail.com',
  github: 'https://github.com/haziqhaiqal',
  linkedin: 'https://linkedin.com/in/mhaziqhaiqal',
  whatsapp: 'https://wa.me/mhaziqhaiqal',
} as const;
