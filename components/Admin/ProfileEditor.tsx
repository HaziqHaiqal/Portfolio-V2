'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Briefcase,
  FileText,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Save,
  Twitter,
  User,
  X,
} from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import { upsertProfileAction } from '@app/admin/_actions/profile';
import UniversalUpload, {
  type UniversalUploadHandle,
} from '@components/Media/UniversalUpload';
import UniversalImage from '@components/Media/UniversalImage';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Badge } from '@components/ui/badge';
import { Switch } from '@components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';
import {
  Field,
  FormGrid,
  FormSection,
  PageHeader,
  PageSkeleton,
  ToggleRow,
} from '@components/Admin/shared';
import { rise } from '@constants/motion';
import { cn } from '@lib/utils';

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

const availabilityStyles: Record<string, string> = {
  Available: 'border-success/40 bg-success/10 text-success',
  Busy: 'border-warning/40 bg-warning/10 text-warning',
  Unavailable: 'border-border bg-muted text-muted-foreground',
};

const socialFields = [
  {
    field: 'website_url',
    label: 'Website',
    icon: Globe,
    placeholder: 'https://yoursite.com',
  },
  {
    field: 'github_url',
    label: 'GitHub',
    icon: Github,
    placeholder: 'https://github.com/username',
  },
  {
    field: 'linkedin_url',
    label: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    field: 'twitter_url',
    label: 'X / Twitter',
    icon: Twitter,
    placeholder: 'https://x.com/username',
  },
] as const;

export default function ProfileEditor() {
  const [profileData, setProfileData] =
    useState<ProfileData>(initialProfileData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [committingUpload, setCommittingUpload] = useState(false);
  const [languageInput, setLanguageInput] = useState('');
  const profileImageUploadRef = useRef<UniversalUploadHandle>(null);
  const resumeUploadRef = useRef<UniversalUploadHandle>(null);

  const [savedSnapshot, setSavedSnapshot] = useState<string>(
    JSON.stringify(initialProfileData)
  );

  const supabase = useMemo(() => createBrowserSupabase(), []);

  const loadProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast.error('Could not load profile');
        return;
      }

      if (data) {
        const normalized: ProfileData = {
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
        setProfileData(normalized);
        setSavedSnapshot(JSON.stringify(normalized));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Could not load profile');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isDirty = JSON.stringify(profileData) !== savedSnapshot;

  const handleSave = async () => {
    let next = { ...profileData };

    const pendingUploads = [
      {
        ref: profileImageUploadRef,
        field: 'profile_image_url' as const,
        label: 'Profile image',
      },
      { ref: resumeUploadRef, field: 'resume_url' as const, label: 'Resume' },
    ];

    try {
      if (pendingUploads.some(({ ref }) => ref.current?.hasPending())) {
        setCommittingUpload(true);
        for (const { ref, field, label } of pendingUploads) {
          if (!ref.current?.hasPending()) continue;
          const result = await ref.current.commitPending();
          if (!result.ok) {
            toast.error(`${label} upload failed: ${result.error}`);
            return;
          }
          if (result.url) next = { ...next, [field]: result.url };
        }
      }

      setSaving(true);
      const data = await upsertProfileAction(next);
      const merged = { ...next, ...data };
      setProfileData(merged);
      setSavedSnapshot(JSON.stringify(merged));
      toast.success('Profile saved');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Could not save profile');
    } finally {
      setCommittingUpload(false);
      setSaving(false);
    }
  };

  const set = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) =>
    setProfileData((prev) => ({ ...prev, [field]: value }));

  const handleAddLanguage = () => {
    const value = languageInput.trim();
    if (!value || profileData.languages.includes(value)) return;
    setProfileData((prev) => ({
      ...prev,
      languages: [...prev.languages, value],
    }));
    setLanguageInput('');
  };

  const handleRemoveLanguage = (language: string) =>
    setProfileData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== language),
    }));

  const busy = saving || committingUpload;

  if (loading) {
    return (
      <PageSkeleton>
        <div className="h-96 rounded-xl border border-border bg-card" />
      </PageSkeleton>
    );
  }

  return (
    <motion.div {...rise} className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Profile"
        description="Your name, title, bio, and contact details."
        actions={
          <>
            {isDirty && (
              <span className="hidden items-center gap-1.5 text-xs text-warning sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                Unsaved changes
              </span>
            )}
            <Button size="sm" onClick={handleSave} disabled={busy || !isDirty}>
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {committingUpload ? 'Uploading...' : 'Save profile'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="admin-raised overflow-hidden rounded-xl border border-border bg-card">
            <div className="admin-grid relative flex flex-col items-center border-b border-border bg-surface-sunken/60 px-5 py-6 text-center">
              <div className="admin-raised relative h-20 w-20 overflow-hidden rounded-2xl border border-border bg-surface-raised">
                {profileData.profile_image_url ? (
                  <UniversalImage
                    src={profileData.profile_image_url}
                    alt={profileData.full_name || 'Profile'}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="admin-display mt-4 text-base font-semibold text-foreground">
                {profileData.full_name || 'Your name'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {profileData.title || 'Your professional title'}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  'mt-3 font-normal',
                  availabilityStyles[profileData.availability_status] ??
                    availabilityStyles.Unavailable
                )}
              >
                {profileData.availability_status}
              </Badge>
            </div>

            <dl className="divide-y divide-border/60 text-xs">
              <div className="flex items-center gap-2.5 px-5 py-3">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <dd className="truncate text-foreground">
                  {profileData.location || (
                    <span className="text-muted-foreground">No location</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-3">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <dd className="truncate text-foreground">
                  {profileData.email || (
                    <span className="text-muted-foreground">No email</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-3">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <dd className="truncate text-foreground">
                  {profileData.years_of_experience ? (
                    `${profileData.years_of_experience} years experience`
                  ) : (
                    <span className="text-muted-foreground">
                      Experience not set
                    </span>
                  )}
                </dd>
              </div>
              {profileData.is_freelance_available && (
                <div className="flex items-center gap-2.5 px-5 py-3">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                  <dd className="truncate text-copper">Open to freelance</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>

        <div className="admin-raised space-y-8 rounded-xl border border-border bg-card p-6">
          <FormSection
            title="Identity"
            description="Name, role and how to reach you."
          >
            <FormGrid>
              <Field label="Full name" htmlFor="full_name">
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  placeholder="Ada Lovelace"
                />
              </Field>
              <Field label="Professional title" htmlFor="title">
                <Input
                  id="title"
                  value={profileData.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Full Stack Developer"
                />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+60 12 345 6789"
                />
              </Field>
              <Field label="Location" htmlFor="location">
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Kuala Lumpur, Malaysia"
                />
              </Field>
              <Field label="Years of experience" htmlFor="years_of_experience">
                <Input
                  id="years_of_experience"
                  type="number"
                  min={0}
                  value={profileData.years_of_experience}
                  onChange={(e) =>
                    set('years_of_experience', parseInt(e.target.value) || 0)
                  }
                />
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection
            title="Narrative"
            description="The short line under your name, and the longer story below it."
          >
            <Field
              label="Bio"
              htmlFor="bio"
              hint={`${profileData.bio.length} characters — keep it to a sentence or two.`}
            >
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="One or two lines that introduce you."
                className="min-h-[90px] resize-y"
              />
            </Field>
            <Field label="About" htmlFor="about">
              <Textarea
                id="about"
                value={profileData.about}
                onChange={(e) => set('about', e.target.value)}
                placeholder="Background, focus areas, and what you're working toward."
                className="min-h-[150px] resize-y"
              />
            </Field>
          </FormSection>

          <FormSection
            title="Links"
            description="Where people can find your work."
          >
            <FormGrid>
              {socialFields.map(({ field, label, icon: Icon, placeholder }) => (
                <Field key={field} label={label} htmlFor={field}>
                  <div className="relative">
                    <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field}
                      value={profileData[field]}
                      onChange={(e) => set(field, e.target.value)}
                      placeholder={placeholder}
                      className="pl-9"
                    />
                  </div>
                </Field>
              ))}
            </FormGrid>
          </FormSection>

          <FormSection title="Work preferences">
            <FormGrid>
              <Field label="Availability" htmlFor="availability_status">
                <Select
                  value={profileData.availability_status}
                  onValueChange={(v) => set('availability_status', v)}
                >
                  <SelectTrigger id="availability_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Preferred contact" htmlFor="preferred_contact">
                <Select
                  value={profileData.preferred_contact}
                  onValueChange={(v) => set('preferred_contact', v)}
                >
                  <SelectTrigger id="preferred_contact">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Hourly rate" htmlFor="hourly_rate">
                <Input
                  id="hourly_rate"
                  value={profileData.hourly_rate}
                  onChange={(e) => set('hourly_rate', e.target.value)}
                  placeholder="$50/hour"
                />
              </Field>
              <Field label="Timezone" htmlFor="timezone">
                <Input
                  id="timezone"
                  value={profileData.timezone}
                  onChange={(e) => set('timezone', e.target.value)}
                  placeholder="UTC+8 (MYT)"
                />
              </Field>
            </FormGrid>

            <ToggleRow
              label="Available for freelance"
              description="Shows an open-to-work marker on your portfolio."
              control={
                <Switch
                  checked={profileData.is_freelance_available}
                  onCheckedChange={(checked) =>
                    set('is_freelance_available', checked)
                  }
                />
              }
            />
          </FormSection>

          <FormSection title="Languages" description="Press Enter to add.">
            <div className="flex gap-2">
              <Input
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                placeholder="English, Malay, Japanese..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLanguage();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddLanguage}
                disabled={!languageInput.trim()}
                aria-label="Add language"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {profileData.languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.languages.map((language, i) => (
                  <Badge
                    key={`${language}-${i}`}
                    variant="secondary"
                    className="gap-1.5 py-1 pl-2.5 pr-1.5 font-normal"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(language)}
                      aria-label={`Remove ${language}`}
                      className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No languages added yet.
              </p>
            )}
          </FormSection>

          <FormSection
            title="Files"
            description="Profile photo and downloadable CV."
          >
            <FormGrid>
              <Field label="Profile image">
                <UniversalUpload
                  ref={profileImageUploadRef}
                  uploadType="profile_image"
                  entityId="profile"
                  value={profileData.profile_image_url}
                  onChange={(url: string) => set('profile_image_url', url)}
                  enableCrop={true}
                  cropAspect={1}
                />
              </Field>
              <Field label="Résumé / CV">
                <UniversalUpload
                  ref={resumeUploadRef}
                  uploadType="resume"
                  entityId="profile"
                  value={profileData.resume_url}
                  onChange={(url: string) => set('resume_url', url)}
                  enableCrop={false}
                />
              </Field>
            </FormGrid>
            {profileData.resume_url && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />A résumé is attached to your
                profile.
              </p>
            )}
          </FormSection>
        </div>
      </div>
    </motion.div>
  );
}
