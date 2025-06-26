export interface ProjectProps {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tech: string;
  year: string;
  status: string;
  gradient: string;
  commits: string;
  languages: string[];
  category: string;
  featured: boolean;
  projectUrl?: string;
  githubUrl?: string;
  features?: string[];
  teamSize?: string;
  duration?: string;
  images?: Array<{ id:string; url:string; alt:string; caption?:string }>;
  thumbnail_url?: string;
} 