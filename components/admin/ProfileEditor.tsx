"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalUpload from '@components/admin/UniversalUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Badge } from '@components/ui/badge';
import { Label } from '@components/ui/label';
import { Switch } from '@components/ui/switch';
import { 
  User, 
  Globe, 
  Briefcase,
  Check,
  AlertCircle,
  FileText,
  Sparkles,
  Loader2,
  Plus,
  X,
  Save
} from 'lucide-react';

interface ProfileData {
  id?: string;
  full_name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  about: string;
  website_url: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  profile_image_url: string;
  resume_url: string;
  date_of_birth: string;
  years_of_experience: number;
  availability_status: string;
  hourly_rate: string;
  preferred_contact: string;
  languages: string[];
  timezone: string;
  is_freelance_available: boolean;
  created_at?: string;
  updated_at?: string;
}

const initialProfileData: ProfileData = {
  full_name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  about: '',
  website_url: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  profile_image_url: '',
  resume_url: '',
  date_of_birth: '',
  years_of_experience: 0,
  availability_status: 'Available',
  hourly_rate: '',
  preferred_contact: 'email',
  languages: [],
  timezone: '',
  is_freelance_available: false,
};

export default function ProfileEditor() {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [languageInput, setLanguageInput] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: 'Error loading profile data' });
        return;
      }

      if (data) {
        const normalizedProfile = {
          ...initialProfileData,
          ...data,
          full_name: data.full_name || '',
          title: data.title || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          about: data.about || '',
          website_url: data.website_url || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          twitter_url: data.twitter_url || '',
          profile_image_url: data.profile_image_url || '',
          resume_url: data.resume_url || '',
          date_of_birth: data.date_of_birth || '',
          hourly_rate: data.hourly_rate || '',
          preferred_contact: data.preferred_contact || 'email',
          timezone: data.timezone || '',
          availability_status: data.availability_status || 'Available',
          languages: data.languages || [],
          years_of_experience: data.years_of_experience || 0,
          is_freelance_available: data.is_freelance_available || false,
        };
        setProfileData(normalizedProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Error loading profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profile')
        .upsert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error saving profile:', error);
        setMessage({ type: 'error', text: 'Error saving profile. Please try again.' });
        return;
      }

      setProfileData(data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Error saving profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string | number | boolean | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLanguage = () => {
    if (languageInput.trim() && !profileData.languages.includes(languageInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()]
      }));
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <User className="w-4 h-4" />
            Loading profile data...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-xl mb-2 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <User size={24} />
            profile.manage()
          </motion.div>
          <p className="text-gray-400 font-mono">
            <span className="text-blue-500">{'// '}</span>
            Manage your personal and professional information.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Success/Error Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' 
                : 'bg-red-500/10 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Form */}
      <div className="grid gap-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <User className="h-6 w-6 text-white" />
                </motion.div>
                Basic Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Full Name</Label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Your full name"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Professional Title</Label>
                  <Input
                    value={profileData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Full Stack Developer"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Phone</Label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Location</Label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Years of Experience</Label>
                  <Input
                    type="number"
                    value={profileData.years_of_experience}
                    onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Bio</Label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="A brief description about yourself..."
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">About</Label>
                <Textarea
                  value={profileData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  placeholder="Detailed information about your background, skills, and experience..."
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Globe className="h-6 w-6 text-white" />
                </motion.div>
                Social Links
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your online presence and portfolio links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Website</Label>
                  <Input
                    value={profileData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">GitHub</Label>
                  <Input
                    value={profileData.github_url}
                    onChange={(e) => handleInputChange('github_url', e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">LinkedIn</Label>
                  <Input
                    value={profileData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Twitter</Label>
                  <Input
                    value={profileData.twitter_url}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/yourusername"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Briefcase className="h-6 w-6 text-white" />
                </motion.div>
                Professional Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Work availability and professional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Availability Status</Label>
                  <select
                    value={profileData.availability_status}
                    onChange={(e) => handleInputChange('availability_status', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-700 focus:border-blue-500 rounded-md px-3 py-2 text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Preferred Contact</Label>
                  <select
                    value={profileData.preferred_contact}
                    onChange={(e) => handleInputChange('preferred_contact', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-700 focus:border-blue-500 rounded-md px-3 py-2 text-white"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Hourly Rate</Label>
                  <Input
                    value={profileData.hourly_rate}
                    onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                    placeholder="$50/hour"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Timezone</Label>
                  <Input
                    value={profileData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    placeholder="UTC-5 (EST)"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <Label className="text-white font-medium">Available for Freelance</Label>
                  <p className="text-sm text-gray-400">Show availability for freelance projects</p>
                </div>
                <Switch
                  checked={profileData.is_freelance_available}
                  onCheckedChange={(checked) => handleInputChange('is_freelance_available', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Globe className="h-6 w-6 text-white" />
                </motion.div>
                Languages
              </CardTitle>
              <CardDescription className="text-gray-400">
                Languages you speak and their proficiency levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="e.g., English, Spanish, French"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
                <Button
                  type="button"
                  onClick={handleAddLanguage}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profileData.languages.map((language, index) => (
                  <Badge
                    key={index}
                    className="bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 px-3 py-1"
                  >
                    {language}
                    <button
                      onClick={() => handleRemoveLanguage(language)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Media Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <FileText className="h-6 w-6 text-white" />
                </motion.div>
                Media & Files
              </CardTitle>
              <CardDescription className="text-gray-400">
                Upload your profile image and resume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-white">Profile Image</Label>
                  <UniversalUpload
                    uploadType="profile_image"
                    entityId="profile"
                    value={profileData.profile_image_url}
                    onChange={(url: string) => handleInputChange('profile_image_url', url)}
                    enableCrop={true}
                    cropAspect={1}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-white">Resume/CV</Label>
                  <UniversalUpload
                    uploadType="resume"
                    entityId="profile"
                    value={profileData.resume_url}
                    onChange={(url: string) => handleInputChange('resume_url', url)}
                    enableCrop={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
} 