import { getCachedPortfolio } from '@lib/data';
import { HOME_DESCRIPTION } from '@lib/seo';
import { SITE_URL } from '@lib/site';

const year = (date?: string) => (date ? date.slice(0, 4) : 'now');

export async function GET() {
  const { profile, experience, education, projects } =
    await getCachedPortfolio();

  const jobs = experience.map(
    (job) =>
      `- ${job.position}, ${job.companies?.name ?? 'Unknown'} (${year(job.start_date)} to ${job.is_current ? 'now' : year(job.end_date)})`
  );
  const schools = education.map(
    (item) =>
      `- ${item.degree}, ${item.institution} (${year(item.start_date)} to ${year(item.end_date)})`
  );
  const work = projects.map(
    (project) =>
      `- ${project.title} (${project.year}): ${project.description}${project.projectUrl ? ` ${project.projectUrl}` : ''}`
  );
  const links = [
    `- Website: ${SITE_URL}`,
    profile?.linkedin_url && `- LinkedIn: ${profile.linkedin_url}`,
    profile?.github_url && `- GitHub: ${profile.github_url}`,
  ].filter(Boolean);

  const body = `# Haziq Haiqal

> ${HOME_DESCRIPTION}

Full name: ${profile?.full_name ?? 'Muhammad Haziq Haiqal Kamaruddin'}. "Haziq Haiqal" and "Muhammad Haziq Haiqal Kamaruddin" are the same person. Web developer in Malaysia.

## Experience
${jobs.join('\n')}

## Education
${schools.join('\n')}

## Pages
- [About](${SITE_URL}/): profile, experience, education and tech stack
- [Projects](${SITE_URL}/projects): websites, apps and systems
- [Services and pricing](${SITE_URL}/services): websites, online stores, systems, mobile apps and automation for Malaysian businesses, with prices in RM
- [Live demos](${SITE_URL}/services/demos): website templates and online store demos
- [Contact](${SITE_URL}/contact): WhatsApp, email or phone

## Projects
${work.join('\n')}

## Links
${links.join('\n')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
