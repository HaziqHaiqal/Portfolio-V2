'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';

interface ProfileData {
  id: string;
  full_name: string;
  display_name: string;
  title: string;
  subtitle: string;
  bio: string;
  location: string;
  phone: string;
  email: string;
  profile_image_url: string;
  resume_url: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  status: string;
  response_time: string;
  years_coding: number;
  projects_count: number;
  lines_of_code: string;
  coffee_consumed: string;
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setMessage('Error loading profile');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error loading profile');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (field: keyof ProfileData, value: string | number) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profile')
        .update(profile)
        .eq('id', profile.id);

      if (error) {
        console.error('Error saving profile:', error);
        setMessage('Error saving profile');
        return;
      }

      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>No profile found. Please create a profile first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">Profile Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-400/30 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.includes('Error')
            ? 'bg-red-500/20 text-red-400 border-red-400/30'
            : 'bg-green-500/20 text-green-400 border-green-400/30'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Display Name</label>
              <input
                type="text"
                value={profile.display_name || ''}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                placeholder="Name shown publicly"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Title</label>
              <input
                type="text"
                value={profile.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Subtitle</label>
              <input
                type="text"
                value={profile.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Bio</label>
              <textarea
                rows={4}
                value={profile.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Contact & Links
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Phone</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Profile Image URL</label>
              <input
                type="url"
                value={profile.profile_image_url || ''}
                onChange={(e) => handleInputChange('profile_image_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Resume URL</label>
              <input
                type="url"
                value={profile.resume_url || ''}
                onChange={(e) => handleInputChange('resume_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedin_url || ''}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">GitHub URL</label>
              <input
                type="url"
                value={profile.github_url || ''}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Website URL</label>
              <input
                type="url"
                value={profile.website_url || ''}
                onChange={(e) => handleInputChange('website_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats & Status */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
          Stats & Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Status</label>
            <select
              value={profile.status || ''}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            >
              <option value="available_for_hire">Available for Hire</option>
              <option value="open_to_opportunities">Open to Opportunities</option>
              <option value="busy">Busy</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Response Time</label>
            <input
              type="text"
              value={profile.response_time || ''}
              onChange={(e) => handleInputChange('response_time', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Years Coding</label>
            <input
              type="number"
              value={profile.years_coding || ''}
              onChange={(e) => handleInputChange('years_coding', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Projects Count</label>
            <input
              type="number"
              value={profile.projects_count || ''}
              onChange={(e) => handleInputChange('projects_count', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Lines of Code</label>
            <input
              type="text"
              value={profile.lines_of_code || ''}
              onChange={(e) => handleInputChange('lines_of_code', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Coffee Consumed</label>
            <input
              type="text"
              value={profile.coffee_consumed || ''}
              onChange={(e) => handleInputChange('coffee_consumed', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 