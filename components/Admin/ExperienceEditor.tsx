'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Loader2,
  MapPin,
  Plus,
  Save,
} from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  upsertExperienceAction,
  deleteExperienceAction,
} from '@app/admin/_actions/experience';
import CompanySelector from '@components/Admin/CompanySelector';
import UniversalImage from '@components/Media/UniversalImage';
import { Company } from '@lib/supabase';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { Badge } from '@components/ui/badge';
import { Textarea } from '@components/ui/textarea';
import {
  BulletList,
  ConfirmDialog,
  EditDeleteActions,
  EditorPanel,
  EmptyState,
  Field,
  FormActions,
  FormGrid,
  FormSection,
  ListSkeleton,
  MediaTile,
  PageHeader,
  SearchInput,
  TagInput,
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { listContainer, listItem } from '@constants/motion';
import { pluralize } from '@lib/format';
import { cn } from '@lib/utils';

interface ExperienceData {
  id?: string;
  company_id: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  /** Joined from the companies table. */
  companies?: Company;
}

const initialExperienceData: ExperienceData = {
  company_id: '',
  position: '',
  start_date: '',
  end_date: '',
  is_current: false,
  location: '',
  description: '',
  responsibilities: [],
  technologies: [],
  achievements: [],
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const formatDateRange = (
  startDate: string,
  endDate: string,
  isCurrent: boolean
) => {
  const start = formatDate(startDate);
  const end = isCurrent ? 'Present' : formatDate(endDate);
  if (start && end) return `${start} — ${end}`;
  if (start) return `${start} — ${isCurrent ? 'Present' : 'N/A'}`;
  return 'Dates not set';
};

export default function ExperienceEditor() {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<ExperienceData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<ExperienceData>();

  const loadExperiences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*, companies(*)')
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error loading experiences:', error);
        toast.error('Failed to load experiences');
        return;
      }

      // Normalize so array fields are always arrays and text fields are never
      // null — the rest of the component can then assume the shape.
      setExperiences(
        (data || []).map((experience) => ({
          id: experience.id,
          company_id: experience.company_id || '',
          position: experience.position || '',
          start_date: experience.start_date || '',
          end_date: experience.end_date || '',
          location: experience.location || '',
          description: experience.description || '',
          responsibilities: Array.isArray(experience.responsibilities)
            ? experience.responsibilities
            : [],
          technologies: Array.isArray(experience.technologies)
            ? experience.technologies
            : [],
          achievements: Array.isArray(experience.achievements)
            ? experience.achievements
            : [],
          is_current: Boolean(experience.is_current),
          companies: experience.companies || undefined,
        }))
      );
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred while loading experiences');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleDelete = async (experience: ExperienceData) => {
    try {
      await deleteExperienceAction(experience.id!);
      toast.success('Role deleted');
      await loadExperiences();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete role');
    }
  };

  const prepareDbData = (data: ExperienceData, forUpdate = false) => {
    const clean = (val?: string | null) => (isEmpty(val?.trim()) ? null : val);

    const dbData = {
      company_id: data.company_id,
      position: data.position,
      start_date: data.start_date,
      end_date: data.is_current ? null : clean(data.end_date),
      is_current: data.is_current,
      location: clean(data.location),
      description: clean(data.description),
      responsibilities: data.responsibilities,
      technologies: data.technologies,
      achievements: data.achievements,
      ...(forUpdate && { updated_at: new Date().toISOString() }),
    };

    // Inserts omit nulls so Postgres defaults apply; updates keep them so a
    // field can be cleared (e.g. end_date when switching to "current").
    return forUpdate
      ? dbData
      : Object.fromEntries(
          Object.entries(dbData).filter(([, v]) => v !== null)
        );
  };

  const handleSave = async (experienceData: ExperienceData) => {
    setSaving(true);
    try {
      const isUpdate = !!editingExperience?.id;
      const dbData = prepareDbData(experienceData, isUpdate);
      const payload = isUpdate
        ? { ...dbData, id: editingExperience!.id }
        : dbData;

      await upsertExperienceAction(payload);
      toast.success(isUpdate ? 'Role updated' : 'Role created');
      setShowForm(false);
      setEditingExperience(null);
      await loadExperiences();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        `Failed to ${editingExperience?.id ? 'update' : 'create'} role`
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredExperiences = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return experiences;
    return experiences.filter(
      (experience) =>
        (experience.companies?.name || '').toLowerCase().includes(needle) ||
        experience.position.toLowerCase().includes(needle) ||
        experience.location.toLowerCase().includes(needle)
    );
  }, [experiences, query]);

  type ExperienceGroup = {
    company: string;
    logo?: string;
    location?: string;
    roles: ExperienceData[];
    totalYears: number;
  };

  const groupedExperiences = useMemo<ExperienceGroup[]>(() => {
    const grouped = filteredExperiences.reduce<
      Record<string, ExperienceData[]>
    >((acc, item) => {
      const key = item.companies?.name?.trim() || 'Untitled Company';
      (acc[key] ??= []).push(item);
      return acc;
    }, {});

    const msInYear = 1000 * 60 * 60 * 24 * 365;

    return Object.entries(grouped)
      .map(([company, roles]) => {
        const sortedRoles = [...roles].sort((a, b) => {
          const aDate = new Date(a.start_date || a.end_date || '').getTime();
          const bDate = new Date(b.start_date || b.end_date || '').getTime();
          return bDate - aDate;
        });

        const totalYears = sortedRoles.reduce((sum, role) => {
          if (!role.start_date) return sum;
          const start = new Date(role.start_date);
          const end =
            role.is_current || !role.end_date
              ? new Date()
              : new Date(role.end_date);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return sum;
          }
          return (
            sum + Math.max(0, (end.getTime() - start.getTime()) / msInYear)
          );
        }, 0);

        const primary = sortedRoles[0];
        return {
          company,
          logo:
            primary?.companies?.logo_url ||
            sortedRoles.find((role) => role.companies?.logo_url)?.companies
              ?.logo_url,
          location:
            primary?.location ||
            sortedRoles.find((role) => role.location)?.location,
          roles: sortedRoles,
          totalYears,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.roles[0].start_date || a.roles[0].end_date || ''
        ).getTime();
        const dateB = new Date(
          b.roles[0].start_date || b.roles[0].end_date || ''
        ).getTime();
        return dateB - dateA;
      });
  }, [filteredExperiences]);

  const startCreate = () => {
    setEditingExperience(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ExperienceForm
        experience={editingExperience || initialExperienceData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingExperience(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career"
        title="Experience"
        description="Roles grouped by employer, newest first."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New role
          </Button>
        }
      />

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filteredExperiences.length, 'role')} across ${pluralize(
                groupedExperiences.length,
                'company',
                'companies'
              )}`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by company, position or location..."
          className="sm:max-w-sm"
        />
      </Toolbar>

      {loading ? (
        <ListSkeleton count={3} />
      ) : groupedExperiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={query.trim() ? 'No matching roles' : 'No experience yet'}
          description={
            query.trim()
              ? 'Try a different company, position or location.'
              : 'Add your first role to start building the career timeline.'
          }
          action={
            query.trim() ? (
              <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New role
              </Button>
            )
          }
        />
      ) : (
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {groupedExperiences.map((group) => (
            <motion.section
              key={group.company}
              variants={listItem}
              className="admin-raised overflow-hidden rounded-xl border border-border bg-card"
            >
              {/* Employer header */}
              <header className="flex items-center gap-3 border-b border-border bg-surface-sunken/40 px-5 py-4">
                <MediaTile className="h-11 w-11">
                  {group.logo ? (
                    <UniversalImage
                      src={group.logo}
                      alt={group.company}
                      width={44}
                      height={44}
                      className="h-11 w-11 object-cover"
                    />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                </MediaTile>
                <div className="min-w-0 flex-1">
                  <h2 className="admin-display truncate text-base font-semibold text-foreground">
                    {group.company}
                  </h2>
                  {group.location && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {group.location}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="admin-display text-sm font-medium tabular-nums text-foreground">
                    {group.totalYears > 0
                      ? `${group.totalYears.toFixed(1)} yrs`
                      : '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pluralize(group.roles.length, 'role')}
                  </p>
                </div>
              </header>

              {/*
                Roles as a timeline: a single rail runs down the group and each
                role hangs off it, so promotions within one company read as one
                continuous stretch rather than as unrelated cards.
              */}
              <ol className="relative px-5 py-4">
                <span
                  aria-hidden
                  className="absolute bottom-8 left-[26px] top-8 w-px bg-border"
                />
                {group.roles.map((role) => (
                  <li key={role.id} className="relative flex gap-4 py-3">
                    <span
                      aria-hidden
                      className={cn(
                        'relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-card',
                        role.is_current
                          ? 'bg-copper shadow-[0_0_8px_hsl(var(--brand-copper))]'
                          : 'bg-border'
                      )}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="admin-display text-sm font-medium text-foreground">
                              {role.position}
                            </h3>
                            {role.is_current && (
                              <Badge
                                variant="outline"
                                className="border-copper/40 bg-copper/10 px-1.5 py-0 text-[10px] font-normal text-copper"
                              >
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              {formatDateRange(
                                role.start_date,
                                role.end_date,
                                role.is_current
                              )}
                            </span>
                            {role.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                {role.location}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <EditDeleteActions
                            onEdit={() => {
                              setEditingExperience(role);
                              setShowForm(true);
                            }}
                            onDelete={() => confirmDelete.ask(role)}
                          />
                        </div>
                      </div>

                      {role.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {role.description}
                        </p>
                      )}

                      {role.technologies.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {role.technologies.slice(0, 6).map((tech, i) => (
                            <Badge
                              key={`${tech}-${i}`}
                              variant="secondary"
                              className="px-2 py-0 text-[11px] font-normal"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {role.technologies.length > 6 && (
                            <Badge
                              variant="outline"
                              className="px-2 py-0 text-[11px] font-normal text-muted-foreground"
                            >
                              +{role.technologies.length - 6}
                            </Badge>
                          )}
                        </div>
                      )}

                      {(role.responsibilities.length > 0 ||
                        role.achievements.length > 0) && (
                        <p className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          {role.responsibilities.length > 0 && (
                            <span>
                              {pluralize(
                                role.responsibilities.length,
                                'responsibility',
                                'responsibilities'
                              )}
                            </span>
                          )}
                          {role.achievements.length > 0 && (
                            <span className="flex items-center gap-1 text-copper">
                              <Award className="h-3 w-3" />
                              {pluralize(
                                role.achievements.length,
                                'achievement'
                              )}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </motion.section>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete role?"
        description={
          confirmDelete.target
            ? `"${confirmDelete.target.position}" at ${
                confirmDelete.target.companies?.name ?? 'this company'
              } will be removed. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.run(handleDelete)}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- form ---- */

interface ExperienceFormProps {
  experience: ExperienceData;
  onSave: (experience: ExperienceData) => void;
  onCancel: () => void;
  saving: boolean;
}

function ExperienceForm({
  experience,
  onSave,
  onCancel,
  saving,
}: ExperienceFormProps) {
  const [formData, setFormData] = useState<ExperienceData>(() => ({
    ...experience,
    company_id: experience.company_id || experience.companies?.id || '',
    position: experience.position || '',
    start_date: experience.start_date || '',
    end_date: experience.end_date || '',
    location: experience.location || '',
    description: experience.description || '',
    responsibilities: Array.isArray(experience.responsibilities)
      ? experience.responsibilities
      : [],
    technologies: Array.isArray(experience.technologies)
      ? experience.technologies
      : [],
    achievements: Array.isArray(experience.achievements)
      ? experience.achievements
      : [],
    is_current: Boolean(experience.is_current),
  }));

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    experience.companies || null
  );

  const set = <K extends keyof ExperienceData>(
    field: K,
    value: ExperienceData[K]
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCompanyChange = (company: Company | null) => {
    setSelectedCompany(company);
    setFormData((prev) => ({
      ...prev,
      company_id: company?.id || '',
      companies: company || undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const canSubmit =
    !!selectedCompany && !!formData.position && !!formData.start_date;

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={experience.id ? 'Editing role' : 'New role'}
        title={experience.id ? experience.position || 'Edit role' : 'New role'}
        description="One entry per position. Promotions at the same company become separate roles."
        onBack={onCancel}
        backLabel="Experience"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || !canSubmit}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {experience.id ? 'Save changes' : 'Create role'}
            </Button>
          </FormActions>
        }
      >
        <FormSection title="Position">
          <CompanySelector
            value={selectedCompany}
            onChange={handleCompanyChange}
          />

          <FormGrid>
            <Field label="Job title" htmlFor="position" required>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => set('position', e.target.value)}
                placeholder="Senior Full Stack Developer"
                required
              />
            </Field>
            <Field label="Location" htmlFor="location">
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Kuala Lumpur, Malaysia"
              />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Dates">
          <FormGrid>
            <Field label="Start date" htmlFor="start_date" required>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                required
              />
            </Field>
            <Field
              label="End date"
              htmlFor="end_date"
              hint={
                formData.is_current
                  ? 'Disabled — this is your current role.'
                  : undefined
              }
            >
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => set('end_date', e.target.value)}
                disabled={formData.is_current}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              />
            </Field>
          </FormGrid>

          <ToggleRow
            label="I currently work here"
            description="Marks the role as ongoing and clears the end date."
            control={
              <Switch
                checked={formData.is_current}
                onCheckedChange={(checked) => {
                  set('is_current', checked);
                  if (checked) set('end_date', '');
                }}
              />
            }
          />
        </FormSection>

        <FormSection
          title="Summary"
          description="A short overview of the role, shown under the job title."
        >
          <Textarea
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What the role covered and who you worked with."
            className="min-h-[100px] resize-y"
          />
        </FormSection>

        <FormSection title="Tech stack" description="Press Enter to add.">
          <TagInput
            value={formData.technologies}
            onChange={(next) => set('technologies', next)}
            placeholder="React, Node.js, PostgreSQL..."
          />
        </FormSection>

        <FormSection title="Responsibilities">
          <BulletList
            value={formData.responsibilities}
            onChange={(next) => set('responsibilities', next)}
            placeholder="Led a team of five engineers..."
          />
        </FormSection>

        <FormSection
          title="Achievements"
          description="Outcomes worth calling out — numbers land best."
        >
          <BulletList
            value={formData.achievements}
            onChange={(next) => set('achievements', next)}
            placeholder="Cut p95 latency by 40%..."
            icon={Award}
            accent="copper"
          />
        </FormSection>
      </EditorPanel>
    </form>
  );
}
