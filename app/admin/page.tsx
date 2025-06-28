"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
  Activity,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
interface StatsData {
  projects: number;
  experience: number;
  education: number;
  skills: number;
}

interface ActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  delay
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;

  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">
            {value}
          </div>
          <p className="text-xs text-muted-foreground flex items-center">
            {changeType === 'increase' ? (
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
            )}
            <span className={`${changeType === 'increase' ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {change}
            </span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ActivityCard = ({ activity }: { activity: ActivityItem, index: number }) => {
  const statusIcons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle
  };

  const statusColors = {
    success: 'text-green-500 bg-green-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    error: 'text-red-500 bg-red-500/10'
  };

  const StatusIcon = statusIcons[activity.status];
  const ActivityIcon = activity.icon;

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-muted/50 rounded-xl transition-all duration-300">
      <div className="relative">
        <div className={`p-2 rounded-lg ${statusColors[activity.status]}`}>
          <ActivityIcon className="h-4 w-4" />
        </div>
        <StatusIcon className={`h-3 w-3 absolute -top-1 -right-1 ${statusColors[activity.status].split(' ')[0]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {activity.action}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {activity.target}
        </p>
      </div>
      <div className="text-xs text-muted-foreground">
        {activity.timestamp}
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, onClick }: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gray-800 border-gray-700 hover:border-primary/50" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({ projects: 0, experience: 0, education: 0, skills: 0 });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
        loadStats();
        loadActivities();
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase.auth]);

  const loadStats = useCallback(async () => {
    try {
      const [projectsRes, experienceRes, educationRes, skillsRes] = await Promise.all([
        supabase.from('projects').select('id'),
        supabase.from('experience').select('id'),
        supabase.from('education').select('id'),
        supabase.from('skills').select('id')
      ]);

      setStats({
        projects: projectsRes.data?.length || 0,
        experience: experienceRes.data?.length || 0,
        education: educationRes.data?.length || 0,
        skills: skillsRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [supabase]);

  const loadActivities = useCallback(async () => {
    try {
      // Get recent updates from various tables
      const [projectsRes, skillsRes, experienceRes, educationRes] = await Promise.all([
        supabase.from('projects').select('name, updated_at').order('updated_at', { ascending: false }).limit(2),
        supabase.from('skills').select('name, updated_at').order('updated_at', { ascending: false }).limit(2),
        supabase.from('experience').select('position, updated_at').order('updated_at', { ascending: false }).limit(2),
        supabase.from('education').select('degree, updated_at').order('updated_at', { ascending: false }).limit(2)
      ]);

      const activities: ActivityItem[] = [];

      // Add project activities
      projectsRes.data?.forEach(project => {
        activities.push({
          id: `project-${project.name}`,
          action: 'Updated project',
          target: project.name,
          timestamp: new Date(project.updated_at).toLocaleDateString(),
          status: 'success',
          icon: FolderOpen
        });
      });

      // Add skill activities
      skillsRes.data?.forEach(skill => {
        activities.push({
          id: `skill-${skill.name}`,
          action: 'Updated skill',
          target: skill.name,
          timestamp: new Date(skill.updated_at).toLocaleDateString(),
          status: 'success',
          icon: Zap
        });
      });

      // Add experience activities
      experienceRes.data?.forEach(exp => {
        activities.push({
          id: `experience-${exp.position}`,
          action: 'Updated experience',
          target: exp.position,
          timestamp: new Date(exp.updated_at).toLocaleDateString(),
          status: 'success',
          icon: Briefcase
        });
      });

      // Add education activities
      educationRes.data?.forEach(edu => {
        activities.push({
          id: `education-${edu.degree}`,
          action: 'Updated education',
          target: edu.degree,
          timestamp: new Date(edu.updated_at).toLocaleDateString(),
          status: 'success',
          icon: GraduationCap
        });
      });

      // Sort by timestamp and take the 6 most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activities.slice(0, 6));
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    }
  }, [supabase]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your portfolio today.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Projects"
              value={stats.projects}
              change={`${stats.projects} total`}
              changeType="increase"
              icon={FolderOpen}
              delay={0}
            />
            <StatCard
              title="Experience"
              value={stats.experience}
              change={`${stats.experience} positions`}
              changeType="increase"
              icon={Briefcase}
              delay={0.1}
            />
            <StatCard
              title="Education"
              value={stats.education}
              change={`${stats.education} degrees`}
              changeType="increase"
              icon={GraduationCap}
              delay={0.2}
            />
            <StatCard
              title="Skills"
              value={stats.skills}
              change={`${stats.skills} skills`}
              changeType="increase"
              icon={Zap}
              delay={0.3}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Add New Project"
              description="Showcase your latest work"
              icon={FolderOpen}
              onClick={() => router.push('/admin/projects')}
            />
            <QuickActionCard
              title="Update Experience"
              description="Add your recent work experience"
              icon={Briefcase}
              onClick={() => router.push('/admin/experience')}
            />
            <QuickActionCard
              title="Manage Skills"
              description="Update your technical skills"
              icon={Zap}
              onClick={() => router.push('/admin/skills')}
            />
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest updates and changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activities.map((activity, index) => (
                <ActivityCard key={activity.id} activity={activity} index={index} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 