'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import {
  Check,
  ExternalLink,
  LayoutTemplate,
  Loader2,
  Plus,
} from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  upsertTemplateAction,
  deleteTemplateAction,
} from '@app/admin/_actions/templates';
import type { WebsiteTemplate } from '@lib/supabase';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { Badge } from '@components/ui/badge';
import { Textarea } from '@components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';
import UniversalUpload, {
  type UniversalUploadHandle,
} from '@components/Media/UniversalUpload';
import UniversalImage from '@components/Media/UniversalImage';
import {
  BulletList,
  CardCover,
  CardGridSkeleton,
  ConfirmDialog,
  EditDeleteActions,
  EditorPanel,
  EmptyState,
  EntityCard,
  Field,
  FormActions,
  FormGrid,
  FormSection,
  IconAction,
  PageHeader,
  SearchInput,
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { TEMPLATE_CATEGORIES } from '@constants/services';
import { listContainer } from '@constants/motion';
import { formatRM, pluralize } from '@lib/format';
import { cn } from '@lib/utils';

const categoryLabel = (id: string) =>
  TEMPLATE_CATEGORIES.find((category) => category.id === id)?.label ?? id;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type TemplateRow = Parameters<typeof upsertTemplateAction>[0];

export default function TemplatesEditor() {
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<WebsiteTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<WebsiteTemplate>();

  const loadTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('website_templates')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      setTemplates(
        (data ?? []).map((row) => ({
          ...row,
          price: Number(row.price),
          compare_price:
            row.compare_price === null ? null : Number(row.compare_price),
        })) as WebsiteTemplate[]
      );
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSave = async (row: TemplateRow) => {
    const duplicate = templates.find(
      (t) => t.slug === row.slug && t.id !== editing?.id
    );
    if (duplicate) {
      toast.error(`The slug "${row.slug}" is already used.`);
      return;
    }

    setSaving(true);
    try {
      await upsertTemplateAction(row, editing ? 'update' : 'create');
      toast.success(editing ? 'Template updated' : 'Template created');
      setShowForm(false);
      setEditing(null);
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      const msg =
        error instanceof Error ? error.message : 'Failed to save template';
      toast.error(
        msg.includes('23505') || msg.toLowerCase().includes('duplicate')
          ? `The slug "${row.slug}" is already used.`
          : msg
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (template: WebsiteTemplate) => {
    try {
      await deleteTemplateAction(template.id);
      toast.success(`Deleted ${template.name}`);
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete template'
      );
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter((t) =>
      [t.name, t.slug, categoryLabel(t.category)]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [templates, query]);

  const startCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <TemplateForm
        template={editing}
        nextSortOrder={templates.length}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditing(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business"
        title="Templates"
        description="Ready-made website designs with fixed prices, shown on the services page."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New template
          </Button>
        }
      />

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filtered.length, 'template')}${
                query.trim() ? ` of ${templates.length}` : ''
              }`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name or category..."
          className="sm:max-w-xs"
        />
      </Toolbar>

      {loading ? (
        <CardGridSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title={query.trim() ? 'No matching templates' : 'No templates yet'}
          description={
            query.trim()
              ? 'Try a different search term.'
              : 'Add a ready-made design with its fixed price and demo link.'
          }
          action={
            query.trim() ? (
              <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New template
              </Button>
            )
          }
        />
      ) : (
        <m.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((template) => (
            <EntityCard
              key={template.id}
              cover={
                <CardCover>
                  {template.preview_image_url ? (
                    <UniversalImage
                      src={template.preview_image_url}
                      alt={template.name}
                      width={0}
                      height={0}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <LayoutTemplate className="h-6 w-6" />
                    </div>
                  )}
                </CardCover>
              }
              title={template.name}
              subtitle={`${categoryLabel(template.category)} · ${formatRM(template.price)}`}
              meta={
                <Badge
                  variant="outline"
                  className={cn(
                    'px-1.5 py-0 text-[10px] font-normal',
                    template.is_active
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {template.is_active ? 'Live' : 'Hidden'}
                </Badge>
              }
              actions={
                <EditDeleteActions
                  onEdit={() => {
                    setEditing(template);
                    setShowForm(true);
                  }}
                  onDelete={() => confirmDelete.ask(template)}
                  extra={
                    template.demo_url ? (
                      <IconAction
                        label="Open demo"
                        onClick={() =>
                          window.open(
                            template.demo_url,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </IconAction>
                    ) : undefined
                  }
                />
              }
            >
              {template.pages && (
                <p className="text-xs text-muted-foreground">
                  {template.pages}
                </p>
              )}
            </EntityCard>
          ))}
        </m.div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete template?"
        description={
          confirmDelete.target
            ? `"${confirmDelete.target.name}" will be removed from the services page. Hide it instead to keep it for later.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.run(handleDelete)}
      />
    </div>
  );
}

interface TemplateFormProps {
  template: WebsiteTemplate | null;
  nextSortOrder: number;
  onSave: (row: TemplateRow) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function TemplateForm({
  template,
  nextSortOrder,
  onSave,
  onCancel,
  saving,
}: TemplateFormProps) {
  const [templateId] = useState(() => template?.id || crypto.randomUUID());
  const [slugEdited, setSlugEdited] = useState(Boolean(template));
  const [form, setForm] = useState({
    name: template?.name ?? '',
    slug: template?.slug ?? '',
    category: template?.category ?? TEMPLATE_CATEGORIES[0].id,
    price: template ? String(template.price) : '',
    compare_price:
      template?.compare_price != null ? String(template.compare_price) : '',
    pages: template?.pages ?? '',
    description: template?.description ?? '',
    features: template?.features ?? [],
    demo_url: template?.demo_url ?? '',
    preview_image_url: template?.preview_image_url ?? '',
    sort_order: String(template?.sort_order ?? nextSortOrder),
    is_active: template?.is_active ?? true,
  });
  const [committingUpload, setCommittingUpload] = useState(false);
  const uploadRef = useRef<UniversalUploadHandle>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = Number(form.price);
    if (!form.name.trim() || !form.slug) {
      toast.error('A name and slug are required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid price.');
      return;
    }
    const comparePrice = form.compare_price.trim()
      ? Number(form.compare_price)
      : null;
    if (
      comparePrice !== null &&
      (!Number.isFinite(comparePrice) || comparePrice < 0)
    ) {
      toast.error('Enter a valid custom build price, or leave it empty.');
      return;
    }

    let previewUrl = form.preview_image_url;
    if (uploadRef.current?.hasPending()) {
      setCommittingUpload(true);
      try {
        const result = await uploadRef.current.commitPending();
        if (!result.ok) {
          toast.error(`Preview upload failed: ${result.error}`);
          return;
        }
        if (result.url) previewUrl = result.url;
      } finally {
        setCommittingUpload(false);
      }
    }

    await onSave({
      id: templateId,
      name: form.name.trim(),
      slug: form.slug,
      category: form.category,
      price,
      compare_price: comparePrice,
      pages: form.pages.trim(),
      description: form.description.trim(),
      features: form.features,
      demo_url: form.demo_url.trim() || null,
      preview_image_url: previewUrl || null,
      sort_order: Math.floor(Number(form.sort_order) || 0),
      is_active: form.is_active,
    });
  };

  const busy = saving || committingUpload;

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={template ? 'Editing template' : 'New template'}
        title={template ? template.name : 'New template'}
        description="Shown in the Ready-made templates section of the services page."
        onBack={onCancel}
        backLabel="Templates"
        className="max-w-3xl"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={busy || !form.name.trim() || !form.price}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {committingUpload
                ? 'Uploading...'
                : template
                  ? 'Save changes'
                  : 'Create template'}
            </Button>
          </FormActions>
        }
      >
        <FormSection title="Details">
          <FormGrid>
            <Field label="Name" htmlFor="name" required>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!slugEdited) set('slug', slugify(e.target.value));
                }}
                placeholder="Glow Boutique"
                required
                autoFocus
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="slug"
              required
              hint="Used in the demo link, e.g. /templates/glow-boutique"
            >
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set('slug', slugify(e.target.value));
                }}
                placeholder="glow-boutique"
                className="font-mono"
                required
              />
            </Field>
            <Field label="Category" htmlFor="category" required>
              <Select
                value={form.category}
                onValueChange={(value) => set('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Price (RM)" htmlFor="price" required>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="499"
                required
              />
            </Field>
          </FormGrid>
          <Field
            label="Custom build price (RM)"
            htmlFor="compare_price"
            hint="What the same site costs as a custom build in the estimator. Shown on the card for comparison."
          >
            <Input
              id="compare_price"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.compare_price}
              onChange={(e) => set('compare_price', e.target.value)}
              placeholder="1299"
            />
          </Field>
          <Field
            label="Pages"
            htmlFor="pages"
            hint="Number of pages, e.g. 1 page or 5 pages."
          >
            <Input
              id="pages"
              value={form.pages}
              onChange={(e) => set('pages', e.target.value)}
              placeholder="One page"
            />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="A soft, elegant shop page for beauty and fashion brands."
              rows={2}
            />
          </Field>
        </FormSection>

        <FormSection
          title="Highlights"
          description="What's special about this design. Shared inclusions are listed on the page already."
        >
          <BulletList
            value={form.features}
            onChange={(features) => set('features', features)}
            placeholder="Product pages with a WhatsApp cart"
            icon={Check}
          />
        </FormSection>

        <FormSection
          title="Preview"
          description="Card image on the services page. 16:10 works best."
        >
          <UniversalUpload
            ref={uploadRef}
            uploadType="template_preview"
            entityId={templateId}
            value={form.preview_image_url}
            onChange={(url: string) => set('preview_image_url', url)}
            enableCrop={true}
            cropAspect={16 / 10}
            allowUrlInput={true}
          />
          <Field
            label="Live demo link"
            htmlFor="demo_url"
            hint="A path on this site, like /templates/seri-glow, or a full URL."
          >
            <Input
              id="demo_url"
              type="text"
              value={form.demo_url}
              onChange={(e) => set('demo_url', e.target.value)}
              placeholder="/templates/glow-boutique"
            />
          </Field>
        </FormSection>

        <FormSection title="Visibility">
          <FormGrid>
            <Field
              label="Sort order"
              htmlFor="sort_order"
              hint="Lower numbers show first."
            >
              <Input
                id="sort_order"
                type="number"
                inputMode="numeric"
                step="1"
                value={form.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
              />
            </Field>
          </FormGrid>
          <ToggleRow
            label="Live on the services page"
            description="Turn off to hide the template without deleting it."
            control={
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => set('is_active', checked)}
              />
            }
          />
        </FormSection>
      </EditorPanel>
    </form>
  );
}
