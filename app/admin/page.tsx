'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  ArrowRight,
  Briefcase,
  Building2,
  FolderKanban,
  GraduationCap,
  Heart,
  History,
  Sparkles,
  UserIcon,
  type LucideIcon,
} from 'lucide-react';

import {
  EmptyState,
  PageHeader,
  PageSkeleton,
  StatTile,
} from '@components/Admin/shared';
import { listContainer, rise } from '@constants/motion';
import { relativeTime } from '@lib/format';
import { cn } from '@lib/utils';

interface StatsData {
  projects: number;
  experience: number;
  education: number;
  skills: number;
}

interface ActivityItem {
  id: string;
  label: string;
  target: string;
  updatedAt: string;
  icon: LucideIcon;
  href: string;
}

const QUICK_ACTIONS: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}[] = [
  {
    title: 'Add a project',
    description: 'Publish new work to the portfolio',
    icon: FolderKanban,
    href: '/admin/projects',
  },
  {
    title: 'Log experience',
    description: 'Record a role or update a timeline',
    icon: Briefcase,
    href: '/admin/experience',
  },
  {
    title: 'Update skills',
    description: 'Adjust your stack and proficiencies',
    icon: Sparkles,
    href: '/admin/skills',
  },
  {
    title: 'Edit profile',
    description: 'Bio, links, and contact details',
    icon: UserIcon,
    href: '/admin/profile',
  },
];

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    projects: 0,
    experience: 0,
    education: 0,
    skills: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserSupabase();

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from('profile')
      .select('display_name, full_name')
      .single();
    setDisplayName(data?.display_name || data?.full_name || null);
  }, [supabase]);

  const loadStats = useCallback(async () => {
    const [projects, experience, education, skills] = await Promise.all([
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('experience').select('id', { count: 'exact', head: true }),
      supabase.from('education').select('id', { count: 'exact', head: true }),
      supabase.from('skills').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      projects: projects.count ?? 0,
      experience: experience.count ?? 0,
      education: education.count ?? 0,
      skills: skills.count ?? 0,
    });
  }, [supabase]);

  const loadActivities = useCallback(async () => {
    const [projects, skills, experience, education] = await Promise.all([
      supabase
        .from('projects')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false })
        .limit(3),
      supabase
        .from('skills')
        .select('id, name, updated_at')
        .order('updated_at', { ascending: false })
        .limit(3),
      supabase
        .from('experience')
        .select('id, position, updated_at')
        .order('updated_at', { ascending: false })
        .limit(3),
      supabase
        .from('education')
        .select('id, degree, updated_at')
        .order('updated_at', { ascending: false })
        .limit(3),
    ]);

    const items: ActivityItem[] = [
      ...(projects.data ?? []).map((row) => ({
        id: `project-${row.id}`,
        label: 'Project',
        target: row.title,
        updatedAt: row.updated_at,
        icon: FolderKanban,
        href: '/admin/projects',
      })),
      ...(skills.data ?? []).map((row) => ({
        id: `skill-${row.id}`,
        label: 'Skill',
        target: row.name,
        updatedAt: row.updated_at,
        icon: Sparkles,
        href: '/admin/skills',
      })),
      ...(experience.data ?? []).map((row) => ({
        id: `experience-${row.id}`,
        label: 'Experience',
        target: row.position,
        updatedAt: row.updated_at,
        icon: Briefcase,
        href: '/admin/experience',
      })),
      ...(education.data ?? []).map((row) => ({
        id: `education-${row.id}`,
        label: 'Education',
        target: row.degree,
        updatedAt: row.updated_at,
        icon: GraduationCap,
        href: '/admin/education',
      })),
    ];

    items.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setActivities(items.slice(0, 7));
  }, [supabase]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
        await Promise.all([loadProfile(), loadStats(), loadActivities()]);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router, supabase.auth, loadProfile, loadStats, loadActivities]);

  if (loading || !user) {
    return (
      <PageSkeleton>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      </PageSkeleton>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div {...rise}>
        <PageHeader
          eyebrow="Overview"
          title={`Welcome back, ${displayName || user.email?.split('@')[0]}`}
          description="Everything currently published on your portfolio, at a glance."
        />
      </motion.div>

      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile
          label="Projects"
          value={stats.projects}
          icon={FolderKanban}
          onClick={() => router.push('/admin/projects')}
        />
        <StatTile
          label="Experience"
          value={stats.experience}
          hint="roles"
          icon={Briefcase}
          onClick={() => router.push('/admin/experience')}
        />
        <StatTile
          label="Education"
          value={stats.education}
          hint="qualifications"
          icon={GraduationCap}
          onClick={() => router.push('/admin/education')}
        />
        <StatTile
          label="Skills"
          value={stats.skills}
          icon={Sparkles}
          onClick={() => router.push('/admin/skills')}
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
              <History className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Recent activity
              </h2>
            </div>

            {activities.length === 0 ? (
              <EmptyState
                icon={History}
                title="Nothing yet"
                description="Records you create or edit will show up here."
                className="rounded-none border-0 bg-transparent py-12"
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {activities.map((activity) => (
                  <li key={activity.id}>
                    <button
                      type="button"
                      onClick={() => router.push(activity.href)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/40"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                        <activity.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {activity.target}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.label}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {relativeTime(activity.updatedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-medium text-foreground">
                Quick actions
              </h2>
            </div>
            <ul className="divide-y divide-border/60">
              {QUICK_ACTIONS.map((action) => (
                <li key={action.href}>
                  <button
                    type="button"
                    onClick={() => router.push(action.href)}
                    className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-accent/40"
                  >
                    <action.icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {action.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 text-muted-foreground',
                        'opacity-0 transition-opacity group-hover:opacity-100'
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-4">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="flex-1 text-xs text-muted-foreground">
              Companies and interests are managed from the sidebar.
            </p>
            <Heart className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </section>
      </div>
    </div>
  );
}
