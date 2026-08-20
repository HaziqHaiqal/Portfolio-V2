'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ConfirmDialog,
  DataTable,
  EditDeleteActions,
  EmptyState,
  Field,
  FormGrid,
  IconAction,
  Modal,
  PageHeader,
  SearchInput,
  TableSkeleton,
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { pluralize } from '@lib/format';
import { cn } from '@lib/utils';

interface SkillData {
  id?: string;
  name: string;
  category: string;
  years_experience: number;
  is_featured: boolean;
}

const initialSkillData: SkillData = {
  name: '',
  category: '',
  years_experience: 0,
  is_featured: false,
};

const skillCategories = [
  'Frontend',
  'Backend',
  'Database',
  'Cloud',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Soft Skills',
  'Other',
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
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true });

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

  const closeForm = () => {
    setShowForm(false);
    setEditingSkill(null);
  };

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
      closeForm();
      await loadSkills();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not save skill');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (skill: SkillData) => {
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

  const startEdit = (skill: SkillData) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Skills"
        description="The technologies and disciplines you want visitors to see."
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
        <TableSkeleton columns={5} />
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
        <DataTable
          rows={filteredSkills}
          rowKey={(skill) => skill.id!}
          onRowClick={startEdit}
          columns={[
            {
              key: 'skill',
              header: 'Skill',
              cell: (skill) => (
                <span className="truncate font-medium text-foreground">
                  {skill.name}
                </span>
              ),
            },
            {
              key: 'category',
              header: 'Category',
              cell: (skill) => (
                <span className="text-muted-foreground">
                  {skill.category || '—'}
                </span>
              ),
            },
            {
              key: 'experience',
              header: 'Experience',
              cell: (skill) => (
                <span className="tabular-nums text-muted-foreground">
                  {skill.years_experience
                    ? pluralize(skill.years_experience, 'yr')
                    : '—'}
                </span>
              ),
              className: 'hidden sm:table-cell',
              headerClassName: 'hidden sm:table-cell',
            },
            {
              key: 'featured',
              header: 'Featured',
              cell: (skill) => (
                <IconAction
                  label={skill.is_featured ? 'Unfeature' : 'Feature'}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFeatured(skill);
                  }}
                  className={cn(skill.is_featured && 'text-copper')}
                >
                  <Star
                    className={cn(
                      'h-3.5 w-3.5',
                      skill.is_featured && 'fill-current'
                    )}
                  />
                </IconAction>
              ),
              className: 'w-0',
              headerClassName: 'w-0',
            },
            {
              key: 'actions',
              header: '',
              cell: (skill) => (
                <div
                  className="flex items-center justify-end gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EditDeleteActions
                    onEdit={() => startEdit(skill)}
                    onDelete={() => confirmDelete.ask(skill)}
                  />
                </div>
              ),
              className: 'w-0 text-right',
              headerClassName: 'w-0',
            },
          ]}
        />
      )}

      <SkillFormModal
        open={showForm}
        skill={editingSkill || initialSkillData}
        onSave={handleSave}
        onCancel={closeForm}
        saving={saving}
      />

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

interface SkillFormModalProps {
  open: boolean;
  skill: SkillData;
  onSave: (skill: SkillData) => void;
  onCancel: () => void;
  saving: boolean;
}

function SkillFormModal({
  open,
  skill,
  onSave,
  onCancel,
  saving,
}: SkillFormModalProps) {
  const [formData, setFormData] = useState<SkillData>(skill);

  // Re-seed local state whenever a different skill (or a blank one, for
  // create) is opened — the modal instance stays mounted between opens.
  useEffect(() => {
    if (open) setFormData(skill);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, skill.id]);

  const set = <K extends keyof SkillData>(field: K, value: SkillData[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onCancel()}
      title={skill.id ? `Edit ${skill.name || 'skill'}` : 'New skill'}
      description={
        skill.id
          ? 'Update how this skill appears on your portfolio.'
          : 'Add a technology or discipline to your portfolio.'
      }
      footer={
        <Button type="submit" form="skill-form" size="sm" disabled={saving}>
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {skill.id ? 'Save changes' : 'Create skill'}
        </Button>
      }
    >
      <form id="skill-form" onSubmit={handleSubmit} className="space-y-5">
        <FormGrid>
          <Field label="Name" htmlFor="name" required>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="React, PostgreSQL, Figma..."
              required
              autoFocus
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
        </FormGrid>

        <Field
          label="Years of experience"
          htmlFor="years_experience"
          className="max-w-[10rem]"
        >
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
      </form>
    </Modal>
  );
}
