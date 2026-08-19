'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Sparkles, Star, Loader2, Save } from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  upsertSkillAction,
  deleteSkillAction,
} from '@app/admin/_actions/skills';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';
import {
  CardGridSkeleton,
  ConfirmDialog,
  EditDeleteActions,
  EditorPanel,
  EmptyState,
  EntityCard,
  FeaturedMark,
  Field,
  FormActions,
  FormGrid,
  FormSection,
  IconAction,
  MediaTile,
  PageHeader,
  ProficiencyBar,
  SearchInput,
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { listContainer } from '@constants/motion';
import { pluralize } from '@lib/format';
import { cn } from '@lib/utils';

interface SkillData {
  id?: string;
  name: string;
  category: string;
  proficiency_level: number;
  proficiency_percentage: number;
  icon_emoji: string;
  color_from: string;
  color_to: string;
  years_experience: number;
  is_featured: boolean;
  sort_order: number;
}

const initialSkillData: SkillData = {
  name: '',
  category: '',
  proficiency_level: 1,
  proficiency_percentage: 50,
  icon_emoji: '',
  color_from: '#6366F1',
  color_to: '#8B5CF6',
  years_experience: 0,
  is_featured: false,
  sort_order: 0,
};

const skillCategories = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Soft Skills',
  'Other',
];

const skillColors = [
  { name: 'Indigo', from: '#6366F1', to: '#8B5CF6' },
  { name: 'Emerald', from: '#10B981', to: '#14B8A6' },
  { name: 'Violet', from: '#8B5CF6', to: '#EC4899' },
  { name: 'Amber', from: '#F97316', to: '#EF4444' },
  { name: 'Sky', from: '#0EA5E9', to: '#6366F1' },
  { name: 'Slate', from: '#64748B', to: '#94A3B8' },
];

export default function SkillsEditor() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<SkillData>();

  const loadSkills = useCallback(async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading skills:', error);
      toast.error('Could not load skills');
    } else {
      setSkills(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleDelete = async (skill: SkillData) => {
    try {
      await deleteSkillAction(skill.id!);
      toast.success(`Deleted "${skill.name}"`);
      await loadSkills();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not delete skill');
    }
  };

  const handleSave = async (skillData: SkillData) => {
    setSaving(true);
    try {
      const payload = editingSkill?.id
        ? { ...skillData, id: editingSkill.id }
        : (() => {
            const { id: _omit, ...rest } = skillData;
            void _omit;
            return rest;
          })();
      await upsertSkillAction(payload);
      toast.success(editingSkill?.id ? 'Skill updated' : 'Skill created');
      setShowForm(false);
      setEditingSkill(null);
      await loadSkills();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not save skill');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (skill: SkillData) => {
    // Optimistic: the star flips immediately, then reconciles with the server.
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skill.id ? { ...s, is_featured: !s.is_featured } : s
      )
    );
    try {
      await upsertSkillAction({
        id: skill.id,
        is_featured: !skill.is_featured,
      });
      await loadSkills();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not update skill');
      await loadSkills();
    }
  };

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((skill) => {
      const matchesSearch =
        !q ||
        skill.name.toLowerCase().includes(q) ||
        skill.category?.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === 'all' || skill.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [skills, query, categoryFilter]);

  const isFiltered = query.trim() !== '' || categoryFilter !== 'all';

  const startCreate = () => {
    setEditingSkill(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <SkillForm
        skill={editingSkill || initialSkillData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingSkill(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Skills"
        description="Technologies and disciplines shown on your portfolio."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New skill
          </Button>
        }
      />

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filteredSkills.length, 'skill')}${
                isFiltered ? ` of ${skills.length}` : ''
              }`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search skills..."
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 bg-card sm:w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {skillCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      {loading ? (
        <CardGridSkeleton />
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={isFiltered ? 'No matching skills' : 'No skills yet'}
          description={
            isFiltered
              ? 'Try a different search term or category.'
              : 'Add the technologies you work with to show them on your portfolio.'
          }
          action={
            isFiltered ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setCategoryFilter('all');
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New skill
              </Button>
            )
          }
        />
      ) : (
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredSkills.map((skill) => (
            <EntityCard
              key={skill.id}
              media={
                <MediaTile className="text-base">
                  {skill.icon_emoji || skill.name.charAt(0).toUpperCase()}
                </MediaTile>
              }
              title={skill.name}
              subtitle={
                [
                  skill.category,
                  skill.years_experience
                    ? pluralize(skill.years_experience, 'yr')
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || undefined
              }
              adornment={skill.is_featured ? <FeaturedMark /> : null}
              actions={
                <EditDeleteActions
                  onEdit={() => {
                    setEditingSkill(skill);
                    setShowForm(true);
                  }}
                  onDelete={() => confirmDelete.ask(skill)}
                  extra={
                    <IconAction
                      label={skill.is_featured ? 'Unfeature' : 'Feature'}
                      onClick={() => toggleFeatured(skill)}
                      className={cn(skill.is_featured && 'text-copper')}
                    >
                      <Star
                        className={cn(
                          'h-3.5 w-3.5',
                          skill.is_featured && 'fill-current'
                        )}
                      />
                    </IconAction>
                  }
                />
              }
            >
              <ProficiencyBar
                value={skill.proficiency_percentage}
                from={skill.color_from}
                to={skill.color_to}
              />
            </EntityCard>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete skill?"
        description={
          confirmDelete.target
            ? `"${confirmDelete.target.name}" will be removed from your portfolio. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.run(handleDelete)}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- form ---- */

interface SkillFormProps {
  skill: SkillData;
  onSave: (skill: SkillData) => void;
  onCancel: () => void;
  saving: boolean;
}

function SkillForm({ skill, onSave, onCancel, saving }: SkillFormProps) {
  const [formData, setFormData] = useState<SkillData>(skill);

  const set = <K extends keyof SkillData>(field: K, value: SkillData[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={skill.id ? 'Editing skill' : 'New skill'}
        title={skill.id ? skill.name || 'Edit skill' : 'New skill'}
        description={
          skill.id
            ? 'Update how this skill appears on your portfolio.'
            : 'Add a technology or discipline to your portfolio.'
        }
        onBack={onCancel}
        backLabel="Skills"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {skill.id ? 'Save changes' : 'Create skill'}
            </Button>
          </FormActions>
        }
      >
        <FormSection title="Details">
          <FormGrid>
            <Field label="Name" htmlFor="name" required>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="React, PostgreSQL, Figma..."
                required
              />
            </Field>

            <Field label="Category" htmlFor="category">
              <Select
                value={formData.category}
                onValueChange={(value) => set('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Icon"
              htmlFor="icon_emoji"
              hint="A single emoji, shown on the card."
            >
              <Input
                id="icon_emoji"
                value={formData.icon_emoji}
                onChange={(e) => set('icon_emoji', e.target.value)}
                placeholder="⚛️"
              />
            </Field>

            <Field label="Years of experience" htmlFor="years_experience">
              <Input
                id="years_experience"
                type="number"
                min="0"
                value={formData.years_experience}
                onChange={(e) =>
                  set('years_experience', parseInt(e.target.value) || 0)
                }
              />
            </Field>
          </FormGrid>
        </FormSection>

        <FormSection
          title="Proficiency"
          description="Drives the progress bar shown on the skill card."
        >
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Level</span>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formData.proficiency_percentage}%
              </span>
            </div>
            <input
              id="proficiency_percentage"
              type="range"
              min="0"
              max="100"
              value={formData.proficiency_percentage}
              onChange={(e) =>
                set('proficiency_percentage', parseInt(e.target.value))
              }
              className="admin-range"
              aria-label="Proficiency percentage"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>
        </FormSection>

        <FormSection title="Accent" description="Tints the proficiency bar.">
          <div className="flex flex-wrap gap-2">
            {skillColors.map((color) => {
              const selected =
                formData.color_from === color.from &&
                formData.color_to === color.to;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    set('color_from', color.from);
                    set('color_to', color.to);
                  }}
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={selected}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors',
                    selected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-input hover:text-foreground'
                  )}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                    }}
                  />
                  {color.name}
                </button>
              );
            })}
          </div>
        </FormSection>

        <FormSection title="Visibility">
          <ToggleRow
            label="Featured skill"
            description="Highlight this skill at the top of the section."
            control={
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => set('is_featured', checked)}
              />
            }
          />
          <Field
            label="Sort order"
            htmlFor="sort_order"
            hint="Lower numbers appear first."
            className="max-w-[10rem]"
          >
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)}
            />
          </Field>
        </FormSection>
      </EditorPanel>
    </form>
  );
}
