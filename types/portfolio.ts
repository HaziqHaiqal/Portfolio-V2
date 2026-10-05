export interface ProjectProps {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tech: string;
  year: string;
  gradient: string;
  commits: string;
  languages: string[];
  category: string;
  projectUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  features?: string[];
  teamSize?: string;
  duration?: string;
  images?: Array<{ id: string; url: string; alt: string; caption?: string }>;
  thumbnail_url?: string;
}
