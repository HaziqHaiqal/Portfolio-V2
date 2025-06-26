"use client";

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

// Tab components
import ProfileEditor from '../../components/admin/ProfileEditor';
import ProjectsEditor from '../../components/admin/ProjectsEditor';
import ExperienceEditor from '../../components/admin/ExperienceEditor';
import EducationEditor from '../../components/admin/EducationEditor';
import SkillsEditor from '../../components/admin/SkillsEditor';
import InterestsEditor from '../../components/admin/InterestsEditor';

const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'interests', label: 'Interests', icon: '❤️' },
];

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const initAuth = async () => {
            // Import supabase only on client side
            const { supabase } = await import('../../lib/supabase');

            // Check current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
                if (session.user.id === adminUserId) {
                    setUser(session.user);
                } else {
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }

            setLoading(false);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    window.location.href = '/login';
                } else if (session?.user) {
                    const adminUserId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
                    if (session.user.id === adminUserId) {
                        setUser(session.user);
                    }
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        };

        initAuth();
    }, []);

    const handleSignOut = async () => {
        const { supabase } = await import('../../lib/supabase');
        await supabase.auth.signOut();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-green-400 font-mono">
                    <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mb-4"></div>
                    <p>Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Redirecting to login
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileEditor />;
            case 'projects':
                return <ProjectsEditor />;
            case 'experience':
                return <ExperienceEditor />;
            case 'education':
                return <EducationEditor />;
            case 'skills':
                return <SkillsEditor />;
            case 'interests':
                return <InterestsEditor />;
            default:
                return <ProfileEditor />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono">
            {/* Header */}
            <div className="border-b border-green-400/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-green-400">
                            portfolio.admin<span className="animate-pulse">_</span>
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-green-400/70">Welcome, {user.email}</span>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/30"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-green-400/20 text-green-400 border-green-400/50'
                                : 'bg-gray-800/50 text-gray-400 border-gray-600/30 hover:bg-gray-700/50 hover:text-green-400'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[600px]">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
} 