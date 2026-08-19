'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Heart, Star, Loader2, Save } from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  upsertInterestAction,
  deleteInterestAction,
} from '@app/admin/_actions/interests';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { Textarea } from '@components/ui/textarea';
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
  LevelMeter,
  MediaTile,
  PageHeader,
  SearchInput,
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { listContainer } from '@constants/motion';
import { pluralize } from '@lib/format';
import { cn } from '@lib/utils';

interface InterestData {
  id?: string;
  name: string;
  description: string;
  icon_emoji: string;
  category: string;
  proficiency_level: string;
  years_involved: number;
  is_featured: boolean;
  sort_order: number;
}

const initialInterestData: InterestData = {
  name: '',
  description: '',
  icon_emoji: '',
  category: '',
  proficiency_level: 'Beginner',
  years_involved: 0,
  is_featured: false,
  sort_order: 0,
};

const interestCategories = [
  'Technology',
  'Sports',
  'Arts & Culture',
  'Music',
  'Travel',
  'Reading',
  'Gaming',
  'Fitness',
  'Cooking',
  'Photography',
  'Outdoor Activities',
  'Learning',
  'Community',
  'Other',
];

const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function InterestsEditor() {
  const [interests, setInterests] = useState<InterestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingInterest, setEditingInterest] = useState<InterestData | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<InterestData>();

  const loadInterests = useCallback(async () => {
    const { data, error } = await supabase
      .from('interests')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading interests:', error);
      toast.error('Could not load interests');
    } else {
      setInterests(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  const handleDelete = async (interest: InterestData) => {
    try {
      await deleteInterestAction(interest.id!);
      toast.success(`Deleted "${interest.name}"`);
      await loadInterests();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not delete interest');
    }
  };

  const handleSave = async (interestData: InterestData) => {
    setSaving(true);
    try {
      const payload = editingInterest?.id
        ? { ...interestData, id: editingInterest.id }
        : (() => {
            const { id: _omit, ...rest } = interestData;
            void _omit;
            return rest;
          })();
      await upsertInterestAction(payload);
      toast.success(
        editingInterest?.id ? 'Interest updated' : 'Interest created'
      );
      setShowForm(false);
      setEditingInterest(null);
      await loadInterests();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not save interest');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (interest: InterestData) => {
    setInterests((prev) =>
      prev.map((i) =>
        i.id === interest.id ? { ...i, is_featured: !i.is_featured } : i
      )
    );
    try {
      await upsertInterestAction({
        id: interest.id,
        is_featured: !interest.is_featured,
      });
      await loadInterests();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not update interest');
      await loadInterests();
    }
  };

  const filteredInterests = useMemo(() => {
    const q = query.trim().toLowerCase();
    return interests.filter((interest) => {
      const matchesSearch =
        !q ||
        interest.name.toLowerCase().includes(q) ||
        interest.description?.toLowerCase().includes(q) ||
        interest.category?.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === 'all' || interest.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [interests, query, categoryFilter]);

  const isFiltered = query.trim() !== '' || categoryFilter !== 'all';

  const startCreate = () => {
    setEditingInterest(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <InterestForm
        interest={editingInterest || initialInterestData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingInterest(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Interests"
        description="Hobbies and pursuits shown alongside your professional work."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New interest
          </Button>
        }
      />

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filteredInterests.length, 'interest')}${
                isFiltered ? ` of ${interests.length}` : ''
              }`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search interests..."
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 bg-card sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {interestCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Toolbar>

      {loading ? (
        <CardGridSkeleton />
      ) : filteredInterests.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={isFiltered ? 'No matching interests' : 'No interests yet'}
          description={
            isFiltered
              ? 'Try a different search term or category.'
              : 'Add what you do outside of work to round out your profile.'
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
                New interest
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
          {filteredInterests.map((interest) => (
            <EntityCard
              key={interest.id}
              media={
                <MediaTile className="text-base">
                  {interest.icon_emoji || interest.name.charAt(0).toUpperCase()}
                </MediaTile>
              }
              title={interest.name}
              subtitle={
                [
                  interest.category,
                  interest.years_involved
                    ? pluralize(interest.years_involved, 'yr')
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || undefined
              }
              adornment={interest.is_featured ? <FeaturedMark /> : null}
              actions={
                <EditDeleteActions
                  onEdit={() => {
                    setEditingInterest(interest);
                    setShowForm(true);
                  }}
                  onDelete={() => confirmDelete.ask(interest)}
                  extra={
                    <IconAction
                      label={interest.is_featured ? 'Unfeature' : 'Feature'}
                      onClick={() => toggleFeatured(interest)}
                      className={cn(interest.is_featured && 'text-copper')}
                    >
                      <Star
                        className={cn(
                          'h-3.5 w-3.5',
                          interest.is_featured && 'fill-current'
                        )}
                      />
                    </IconAction>
                  }
                />
              }
            >
              <div className="space-y-3">
                {interest.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {interest.description}
                  </p>
                )}
                {interest.proficiency_level && (
                  <LevelMeter
                    level={interest.proficiency_level}
                    levels={proficiencyLevels}
                  />
                )}
              </div>
            </EntityCard>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete interest?"
        description={
          confirmDelete.target
            ? `"${confirmDelete.target.name}" will be removed from your profile. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.run(handleDelete)}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- form ---- */

interface InterestFormProps {
  interest: InterestData;
  onSave: (interest: InterestData) => void;
  onCancel: () => void;
  saving: boolean;
}

function InterestForm({
  interest,
  onSave,
  onCancel,
  saving,
}: InterestFormProps) {
  const [formData, setFormData] = useState<InterestData>(interest);

  const set = <K extends keyof InterestData>(
    field: K,
    value: InterestData[K]
  ) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={interest.id ? 'Editing interest' : 'New interest'}
        title={interest.id ? interest.name || 'Edit interest' : 'New interest'}
        description={
          interest.id
            ? 'Update how this interest appears on your profile.'
            : 'Add a hobby or pursuit to your profile.'
        }
        onBack={onCancel}
        backLabel="Interests"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving || !formData.name || !formData.category}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {interest.id ? 'Save changes' : 'Create interest'}
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
                placeholder="Photography, Hiking, Chess..."
                required
              />
            </Field>

            <Field label="Category" htmlFor="category" required>
              <Select
                value={formData.category}
                onValueChange={(value) => set('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {interestCategories.map((category) => (
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
                placeholder="📸"
              />
            </Field>

            <Field label="Years involved" htmlFor="years_involved">
              <Input
                id="years_involved"
                type="number"
                min={0}
                value={formData.years_involved}
                onChange={(e) =>
                  set('years_involved', parseInt(e.target.value) || 0)
                }
              />
            </Field>
          </FormGrid>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What you enjoy about it, and what you've done with it."
              className="min-h-[100px] resize-y"
            />
          </Field>

          <Field label="Proficiency" htmlFor="proficiency_level">
            <Select
              value={formData.proficiency_level}
              onValueChange={(value) => set('proficiency_level', value)}
            >
              <SelectTrigger id="proficiency_level" className="md:max-w-xs">
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {proficiencyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Visibility">
          <ToggleRow
            label="Featured interest"
            description="Pin this to the top of the interests section."
            control={
              <Switch
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
