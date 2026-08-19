'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Award,
  Calendar,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
  Save,
  Users,
} from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  upsertEducationAction,
  deleteEducationAction,
} from '@app/admin/_actions/education';
import UniversalUpload, {
  type UniversalUploadHandle,
} from '@components/Media/UniversalUpload';
import UniversalImage from '@components/Media/UniversalImage';
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
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { listContainer, listItem } from '@constants/motion';
import { pluralize } from '@lib/format';
import { cn } from '@lib/utils';

interface EducationData {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  specialization: string;
  minor_subject: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  gpa: number;
  grade: string;
  location: string;
  description: string;
  achievements: string[];
  activities: string[];
  logo_url: string;
  sort_order: number;
}

const initialEducationData: EducationData = {
  institution: '',
  degree: '',
  field_of_study: '',
  specialization: '',
  minor_subject: '',
  start_date: '',
  end_date: '',
  is_current: false,
  gpa: 0,
  grade: '',
  location: '',
  description: '',
  achievements: [],
  activities: [],
  logo_url: '',
  sort_order: 0,
};

const normalizeEducationData = (
  education: Partial<EducationData> | null | undefined
): EducationData => ({
  ...initialEducationData,
  ...education,
  institution: education?.institution ?? '',
  degree: education?.degree ?? '',
  field_of_study: education?.field_of_study ?? '',
  specialization: education?.specialization ?? '',
  minor_subject: education?.minor_subject ?? '',
  start_date: education?.start_date ?? '',
  end_date: education?.end_date ?? '',
  is_current: education?.is_current ?? false,
  gpa: Number(education?.gpa ?? 0) || 0,
  grade: education?.grade ?? '',
  location: education?.location ?? '',
  description: education?.description ?? '',
  achievements: Array.isArray(education?.achievements)
    ? education.achievements
    : [],
  activities: Array.isArray(education?.activities) ? education.activities : [],
  logo_url: education?.logo_url ?? '',
  sort_order: education?.sort_order ?? 0,
});

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

const formatGrade = (gpa: number, grade: string) => {
  if (gpa > 0 && grade) return `${gpa} GPA · ${grade}`;
  if (gpa > 0) return `${gpa} GPA`;
  return grade || null;
};

export default function EducationEditor() {
  const [educations, setEducations] = useState<EducationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEducation, setEditingEducation] =
    useState<EducationData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<EducationData>();

  const loadEducations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error loading educations:', error);
        toast.error('Could not load education');
        return;
      }

      setEducations((data || []).map(normalizeEducationData));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not load education');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadEducations();
  }, [loadEducations]);

  const handleDelete = async (education: EducationData) => {
    try {
      await deleteEducationAction(education.id!);
      toast.success('Programme deleted');
      await loadEducations();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not delete programme');
    }
  };

  const handleSave = async (educationData: EducationData) => {
    setSaving(true);

    // sort_order is managed by the list, not the form.
    const dbData = { ...educationData };
    delete (dbData as Partial<EducationData>).sort_order;
    const payload = editingEducation?.id
      ? { ...dbData, id: editingEducation.id }
      : dbData;

    try {
      await upsertEducationAction(payload);
      toast.success(editingEducation?.id ? 'Programme updated' : 'Programme created');
      setShowForm(false);
      setEditingEducation(null);
      await loadEducations();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not save programme');
    } finally {
      setSaving(false);
    }
  };

  const filteredEducations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return educations;
    return educations.filter(
      (education) =>
        education.institution.toLowerCase().includes(needle) ||
        education.degree.toLowerCase().includes(needle) ||
        education.field_of_study.toLowerCase().includes(needle) ||
        education.location.toLowerCase().includes(needle)
    );
  }, [educations, query]);

  type EducationGroup = {
    institution: string;
    logo?: string;
    location?: string;
    programs: EducationData[];
    totalYears: number;
  };

  const groupedEducations = useMemo<EducationGroup[]>(() => {
    const grouped = filteredEducations.reduce<Record<string, EducationData[]>>(
      (acc, item) => {
        const key = item.institution?.trim() || 'Untitled Institution';
        (acc[key] ??= []).push(item);
        return acc;
      },
      {}
    );

    const msInYear = 1000 * 60 * 60 * 24 * 365;

    return Object.entries(grouped)
      .map(([institution, programs]) => {
        const sortedPrograms = [...programs].sort((a, b) => {
          const aDate = new Date(a.start_date || a.end_date || '').getTime();
          const bDate = new Date(b.start_date || b.end_date || '').getTime();
          return bDate - aDate;
        });

        const totalYears = sortedPrograms.reduce((sum, program) => {
          if (!program.start_date) return sum;
          const start = new Date(program.start_date);
          const end =
            program.is_current || !program.end_date
              ? new Date()
              : new Date(program.end_date);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return sum;
          }
          return sum + Math.max(0, (end.getTime() - start.getTime()) / msInYear);
        }, 0);

        const primary = sortedPrograms[0];
        return {
          institution,
          logo:
            primary?.logo_url ||
            sortedPrograms.find((program) => program.logo_url)?.logo_url,
          location:
            primary?.location ||
            sortedPrograms.find((program) => program.location)?.location,
          programs: sortedPrograms,
          totalYears,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.programs[0].start_date || a.programs[0].end_date || ''
        ).getTime();
        const dateB = new Date(
          b.programs[0].start_date || b.programs[0].end_date || ''
        ).getTime();
        return dateB - dateA;
      });
  }, [filteredEducations]);

  const startCreate = () => {
    setEditingEducation(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <EducationForm
        education={editingEducation || initialEducationData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingEducation(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career"
        title="Education"
        description="Qualifications grouped by institution, newest first."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New programme
          </Button>
        }
      />

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filteredEducations.length, 'programme')} across ${pluralize(
                groupedEducations.length,
                'institution'
              )}`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by institution, degree or field..."
          className="sm:max-w-sm"
        />
      </Toolbar>

      {loading ? (
        <ListSkeleton count={2} />
      ) : groupedEducations.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={query.trim() ? 'No matching programmes' : 'No education yet'}
          description={
            query.trim()
              ? 'Try a different institution, degree or field.'
              : 'Add your first qualification to build out this section.'
          }
          action={
            query.trim() ? (
              <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New programme
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
          {groupedEducations.map((group) => (
            <motion.section
              key={group.institution}
              variants={listItem}
              className="admin-raised overflow-hidden rounded-xl border border-border bg-card"
            >
              <header className="flex items-center gap-3 border-b border-border bg-surface-sunken/40 px-5 py-4">
                <MediaTile className="h-11 w-11">
                  {group.logo ? (
                    <UniversalImage
                      src={group.logo}
                      alt={group.institution}
                      width={44}
                      height={44}
                      className="h-11 w-11 object-cover"
                    />
                  ) : (
                    <GraduationCap className="h-4 w-4" />
                  )}
                </MediaTile>
                <div className="min-w-0 flex-1">
                  <h2 className="admin-display truncate text-base font-semibold text-foreground">
                    {group.institution}
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
                    {pluralize(group.programs.length, 'programme')}
                  </p>
                </div>
              </header>

              <ol className="relative px-5 py-4">
                <span
                  aria-hidden
                  className="absolute bottom-8 left-[26px] top-8 w-px bg-border"
                />
                {group.programs.map((program) => {
                  const gradeLabel = formatGrade(program.gpa, program.grade);
                  return (
                    <li key={program.id} className="relative flex gap-4 py-3">
                      <span
                        aria-hidden
                        className={cn(
                          'relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-card',
                          program.is_current
                            ? 'bg-copper shadow-[0_0_8px_hsl(var(--brand-copper))]'
                            : 'bg-border'
                        )}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="admin-display text-sm font-medium text-foreground">
                                {program.degree || 'Untitled programme'}
                              </h3>
                              {program.is_current && (
                                <Badge
                                  variant="outline"
                                  className="border-copper/40 bg-copper/10 px-1.5 py-0 text-[10px] font-normal text-copper"
                                >
                                  In progress
                                </Badge>
                              )}
                            </div>
                            {program.field_of_study && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {program.field_of_study}
                                {program.specialization &&
                                  ` · ${program.specialization}`}
                              </p>
                            )}
                            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {formatDateRange(
                                  program.start_date,
                                  program.end_date,
                                  program.is_current
                                )}
                              </span>
                              {gradeLabel && (
                                <span className="tabular-nums text-primary">
                                  {gradeLabel}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <EditDeleteActions
                              onEdit={() => {
                                setEditingEducation(
                                  normalizeEducationData(program)
                                );
                                setShowForm(true);
                              }}
                              onDelete={() => confirmDelete.ask(program)}
                            />
                          </div>
                        </div>

                        {program.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {program.description}
                          </p>
                        )}

                        {(program.achievements.length > 0 ||
                          program.activities.length > 0) && (
                          <p className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            {program.achievements.length > 0 && (
                              <span className="flex items-center gap-1 text-copper">
                                <Award className="h-3 w-3" />
                                {pluralize(
                                  program.achievements.length,
                                  'achievement'
                                )}
                              </span>
                            )}
                            {program.activities.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {pluralize(
                                  program.activities.length,
                                  'activity',
                                  'activities'
                                )}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </motion.section>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete programme?"
        description={
          confirmDelete.target
            ? `"${confirmDelete.target.degree || 'This programme'}" at ${
                confirmDelete.target.institution || 'this institution'
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

interface EducationFormProps {
  education: EducationData;
  onSave: (education: EducationData) => void | Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function EducationForm({
  education,
  onSave,
  onCancel,
  saving,
}: EducationFormProps) {
  const [formData, setFormData] = useState<EducationData>(() => ({
    ...normalizeEducationData(education),
    // A stable id up front so the logo upload has an entity to attach to.
    id: education.id || crypto.randomUUID(),
  }));
  const [committingUpload, setCommittingUpload] = useState(false);
  const logoUploadRef = useRef<UniversalUploadHandle>(null);

  const set = <K extends keyof EducationData>(
    field: K,
    value: EducationData[K]
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let next = formData;
    if (logoUploadRef.current?.hasPending()) {
      setCommittingUpload(true);
      try {
        const result = await logoUploadRef.current.commitPending();
        if (!result.ok) {
          toast.error(`Logo upload failed: ${result.error}`);
          return;
        }
        if (result.url) next = { ...next, logo_url: result.url };
      } finally {
        setCommittingUpload(false);
      }
    }

    await onSave(next);
  };

  const busy = saving || committingUpload;
  const canSubmit = !!formData.institution.trim() && !!formData.degree.trim();

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={education.id ? 'Editing programme' : 'New programme'}
        title={
          education.id ? education.degree || 'Edit programme' : 'New programme'
        }
        description="One entry per qualification. Multiple programmes at one institution group together."
        onBack={onCancel}
        backLabel="Education"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy || !canSubmit}>
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {committingUpload
                ? 'Uploading...'
                : education.id
                  ? 'Save changes'
                  : 'Create programme'}
            </Button>
          </FormActions>
        }
      >
        <FormSection title="Institution">
          <FormGrid>
            <Field label="Institution" htmlFor="institution" required>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => set('institution', e.target.value)}
                placeholder="Universiti Malaya"
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

          <Field
            label="Institution logo"
            hint="Shown beside the institution name."
          >
            <UniversalUpload
              ref={logoUploadRef}
              uploadType="company_logo"
              entityId={formData.id!}
              value={formData.logo_url}
              onChange={(url: string) => set('logo_url', url)}
              enableCrop={true}
              cropAspect={1}
              allowUrlInput={true}
            />
          </Field>
        </FormSection>

        <FormSection title="Qualification">
          <FormGrid>
            <Field label="Degree" htmlFor="degree" required>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => set('degree', e.target.value)}
                placeholder="Bachelor of Computer Science"
                required
              />
            </Field>
            <Field label="Field of study" htmlFor="field_of_study">
              <Input
                id="field_of_study"
                value={formData.field_of_study}
                onChange={(e) => set('field_of_study', e.target.value)}
                placeholder="Software Engineering"
              />
            </Field>
            <Field label="Specialization" htmlFor="specialization">
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => set('specialization', e.target.value)}
                placeholder="Distributed Systems"
              />
            </Field>
            <Field label="Minor" htmlFor="minor_subject">
              <Input
                id="minor_subject"
                value={formData.minor_subject}
                onChange={(e) => set('minor_subject', e.target.value)}
                placeholder="Mathematics"
              />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Dates">
          <FormGrid>
            <Field label="Start date" htmlFor="start_date">
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => set('start_date', e.target.value)}
              />
            </Field>
            <Field
              label="End date"
              htmlFor="end_date"
              hint={
                formData.is_current
                  ? 'Disabled — this programme is in progress.'
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
            label="Currently studying"
            description="Marks the programme as in progress and clears the end date."
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

        <FormSection title="Results">
          <FormGrid>
            <Field label="GPA" htmlFor="gpa" hint="Leave at 0 to hide.">
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="5"
                value={formData.gpa}
                onChange={(e) => set('gpa', parseFloat(e.target.value) || 0)}
              />
            </Field>
            <Field label="Grade" htmlFor="grade">
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => set('grade', e.target.value)}
                placeholder="First Class Honours"
              />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection title="Summary">
          <Textarea
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What the programme covered and what you focused on."
            className="min-h-[100px] resize-y"
          />
        </FormSection>

        <FormSection
          title="Achievements"
          description="Awards, honours, published work."
        >
          <BulletList
            value={formData.achievements}
            onChange={(next) => set('achievements', next)}
            placeholder="Dean's List, 2022..."
            icon={Award}
            accent="copper"
          />
        </FormSection>

        <FormSection
          title="Activities"
          description="Societies, clubs, and roles outside the syllabus."
        >
          <BulletList
            value={formData.activities}
            onChange={(next) => set('activities', next)}
            placeholder="President, Computing Society..."
            icon={Users}
          />
        </FormSection>
      </EditorPanel>
    </form>
  );
}
