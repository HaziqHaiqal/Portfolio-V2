'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import { Building2, Plus, Loader2, Check, ExternalLink } from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  upsertCompanyAction,
  deleteCompanyAction,
} from '@app/admin/_actions/companies';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Company } from '@lib/supabase';
import UniversalUpload, {
  type UniversalUploadHandle,
} from '@components/Media/UniversalUpload';
import UniversalImage from '@components/Media/UniversalImage';
import {
  CardGridSkeleton,
  ConfirmDialog,
  EditDeleteActions,
  EditorPanel,
  EmptyState,
  EntityCard,
  Field,
  FormActions,
  FormSection,
  MediaTile,
  PageHeader,
  SearchInput,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { listContainer } from '@constants/motion';
import { hostnameOf, pluralize } from '@lib/format';

export default function CompanyEditor() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<Company>();

  const loadCompanies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleDelete = async (company: Company) => {
    try {
      await deleteCompanyAction(company.id);
      toast.success(`Deleted ${company.name}`);
      await loadCompanies();
    } catch (error: unknown) {
      console.error('Error deleting company:', error);
      const msg =
        error instanceof Error ? error.message : 'Failed to delete company';
      if (msg.includes('23503') || msg.toLowerCase().includes('foreign key')) {
        toast.error(
          'Cannot delete — this company is linked to existing roles.'
        );
      } else {
        toast.error(msg);
      }
    }
  };

  const handleSave = async (companyData: Partial<Company>) => {
    setSaving(true);

    try {
      const name = companyData.name?.trim();
      if (!name) {
        toast.error('Company name is required');
        return;
      }

      const duplicate = companies.find(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() &&
          c.id !== editingCompany?.id
      );
      if (duplicate) {
        toast.error(`"${name}" already exists.`);
        return;
      }

      const id = editingCompany?.id ?? companyData.id;
      if (!id) {
        toast.error('Missing company id. Please reload and try again.');
        return;
      }

      await upsertCompanyAction({
        id,
        name,
        logo_url: companyData.logo_url || undefined,
        website_url: companyData.website_url || undefined,
      });
      toast.success(editingCompany?.id ? 'Company updated' : 'Company created');

      setShowForm(false);
      setEditingCompany(null);
      await loadCompanies();
    } catch (error: unknown) {
      console.error('Error saving company:', error);
      const msg =
        error instanceof Error ? error.message : 'Failed to save company';
      if (msg.includes('23505') || msg.toLowerCase().includes('duplicate')) {
        toast.error(`"${companyData.name?.trim()}" already exists.`);
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? companies.filter((c) => c.name.toLowerCase().includes(q))
      : companies;
  }, [companies, query]);

  const startCreate = () => {
    setEditingCompany(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <CompanyForm
        company={editingCompany}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingCompany(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Career"
        title="Companies"
        description="The employers linked to your work history."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New company
          </Button>
        }
      />

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filteredCompanies.length, 'company', 'companies')}${
                query.trim() ? ` of ${companies.length}` : ''
              }`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search companies..."
          className="sm:max-w-xs"
        />
      </Toolbar>

      {loading ? (
        <CardGridSkeleton count={3} />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={query.trim() ? 'No matching companies' : 'No companies yet'}
          description={
            query.trim()
              ? 'Try a different search term.'
              : 'Add a company once, then link it from any role.'
          }
          action={
            query.trim() ? (
              <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New company
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
          {filteredCompanies.map((company) => (
            <EntityCard
              key={company.id}
              media={
                <MediaTile className="h-11 w-11">
                  {company.logo_url ? (
                    <UniversalImage
                      src={company.logo_url}
                      alt={company.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 object-cover"
                    />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                </MediaTile>
              }
              title={company.name}
              subtitle={
                company.website_url ? (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {hostnameOf(company.website_url)}
                  </a>
                ) : (
                  'No website'
                )
              }
              actions={
                <EditDeleteActions
                  onEdit={() => {
                    setEditingCompany(company);
                    setShowForm(true);
                  }}
                  onDelete={() => confirmDelete.ask(company)}
                />
              }
            />
          ))}
        </m.div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete company?"
        description={
          confirmDelete.target
            ? `The logo for "${confirmDelete.target.name}" will be removed. Roles already linked to it are kept.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.run(handleDelete)}
      />
    </div>
  );
}

interface CompanyFormProps {
  company: Company | null;
  onSave: (company: Partial<Company>) => void | Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function CompanyForm({ company, onSave, onCancel, saving }: CompanyFormProps) {
  const [companyId] = useState(() => company?.id || crypto.randomUUID());
  const [formData, setFormData] = useState({
    name: company?.name || '',
    logo_url: company?.logo_url || '',
    website_url: company?.website_url || '',
  });
  const [committingUpload, setCommittingUpload] = useState(false);
  const uploadRef = useRef<UniversalUploadHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let logoUrl = formData.logo_url;
    if (uploadRef.current?.hasPending()) {
      setCommittingUpload(true);
      try {
        const result = await uploadRef.current.commitPending();
        if (!result.ok) {
          toast.error(`Logo upload failed: ${result.error}`);
          return;
        }
        if (result.url) logoUrl = result.url;
      } finally {
        setCommittingUpload(false);
      }
    }

    await onSave({ ...formData, id: companyId, logo_url: logoUrl });
  };

  const busy = saving || committingUpload;

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={company?.id ? 'Editing company' : 'New company'}
        title={company?.id ? company.name || 'Edit company' : 'New company'}
        description="Logos are shared — updating one updates every role that uses it."
        onBack={onCancel}
        backLabel="Companies"
        className="max-w-3xl"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={busy || isEmpty(formData.name.trim())}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {committingUpload
                ? 'Uploading...'
                : company?.id
                  ? 'Save changes'
                  : 'Create company'}
            </Button>
          </FormActions>
        }
      >
        <FormSection title="Details">
          <Field label="Company name" htmlFor="name" required>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Acme Corporation"
              required
              autoFocus
            />
          </Field>

          <Field label="Website" htmlFor="website_url">
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  website_url: e.target.value,
                }))
              }
              placeholder="https://example.com"
            />
          </Field>
        </FormSection>

        <FormSection
          title="Logo"
          description="Upload a square image or paste a URL. Shown on every linked role."
        >
          <UniversalUpload
            ref={uploadRef}
            uploadType="company_logo"
            entityId={companyId}
            value={formData.logo_url}
            onChange={(url: string) =>
              setFormData((prev) => ({ ...prev, logo_url: url }))
            }
            enableCrop={true}
            cropAspect={1}
            allowUrlInput={true}
          />
        </FormSection>
      </EditorPanel>
    </form>
  );
}
