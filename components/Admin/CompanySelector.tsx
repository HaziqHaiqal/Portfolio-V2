'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import {
  Building2,
  Plus,
  Search,
  X,
  Check,
  Loader2,
  Pencil,
  ChevronDown,
} from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import { upsertCompanyAction } from '@app/admin/_actions/companies';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Company } from '@lib/supabase';
import UniversalUpload, {
  type UniversalUploadHandle,
} from '@components/Media/UniversalUpload';
import UniversalImage from '@components/Media/UniversalImage';
import {
  Field,
  IconAction,
  MediaTile,
  Modal,
} from '@components/Admin/shared';
import { cn } from '@lib/utils';

interface CompanySelectorProps {
  value: Company | null;
  onChange: (company: Company | null) => void;
}

const emptyForm = { id: '', name: '', logo_url: '', website_url: '' };

/**
 * Combobox that picks an existing company or creates one inline, so recording
 * a role never requires leaving the form to go set the company up first.
 */
export default function CompanySelector({
  value,
  onChange,
}: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [committingUpload, setCommittingUpload] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<UniversalUploadHandle>(null);
  const supabase = useMemo(() => createBrowserSupabase(), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    void loadCompanies();
  }, [loadCompanies]);

  const openCreateForm = () => {
    // The id is generated up front so a logo can be uploaded before the row
    // exists — the upload path is keyed by entity id.
    setFormData({ ...emptyForm, id: crypto.randomUUID(), name: searchQuery });
    setIsEditing(false);
    setShowForm(true);
    setIsOpen(false);
  };

  const openEditForm = (company: Company) => {
    setFormData({
      id: company.id,
      name: company.name,
      logo_url: company.logo_url || '',
      website_url: company.website_url || '',
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(emptyForm);
  };

  const handleSave = async () => {
    if (isEmpty(formData.name.trim())) {
      toast.error('Company name is required');
      return;
    }

    const trimmedName = formData.name.trim();
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

    setSaving(true);
    try {
      const duplicate = companies.find(
        (c) =>
          c.name.toLowerCase() === trimmedName.toLowerCase() &&
          c.id !== formData.id
      );
      if (duplicate) {
        toast.error(
          isEditing
            ? `"${trimmedName}" already exists. Use a different name.`
            : `"${trimmedName}" already exists. Select it from the list instead.`
        );
        return;
      }

      const saved = await upsertCompanyAction({
        id: formData.id,
        name: trimmedName,
        logo_url: logoUrl || undefined,
        website_url: formData.website_url || undefined,
      });

      toast.success(isEditing ? 'Company updated' : 'Company created');
      await loadCompanies();

      // Creating always selects the new company; editing only re-syncs the
      // selection if this was the one already chosen.
      if (!isEditing || value?.id === formData.id) onChange(saved);

      closeForm();
    } catch (error: unknown) {
      console.error('Error saving company:', error);
      const msg =
        error instanceof Error ? error.message : 'Failed to save company';
      if (msg.includes('23505') || msg.toLowerCase().includes('duplicate')) {
        toast.error(`"${trimmedName}" already exists.`);
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? companies.filter((c) => c.name.toLowerCase().includes(q))
      : companies;
  }, [companies, searchQuery]);

  const handleSelect = (company: Company) => {
    onChange(company);
    setIsOpen(false);
    setSearchQuery('');
  };

  const busy = saving || committingUpload;

  return (
    <>
      <div className="space-y-2" ref={dropdownRef}>
        <label className="text-xs font-medium text-muted-foreground">
          Company<span className="ml-0.5 text-destructive">*</span>
        </label>

        {value ? (
          /* Selected state — reads as a filled control, not as a list row. */
          <div className="admin-raised flex items-center gap-3 rounded-lg border border-border bg-surface-raised/60 p-2.5">
            <MediaTile>
              {value.logo_url ? (
                <UniversalImage
                  src={value.logo_url}
                  alt={value.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-cover"
                />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
            </MediaTile>
            <span className="admin-display flex-1 truncate text-sm font-medium text-foreground">
              {value.name}
            </span>
            <IconAction
              label="Edit company"
              onClick={() => openEditForm(value)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </IconAction>
            <IconAction
              label="Clear selection"
              onClick={() => {
                onChange(null);
                setSearchQuery('');
              }}
            >
              <X className="h-3.5 w-3.5" />
            </IconAction>
          </div>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search or create a company..."
              className="pl-9 pr-9"
              role="combobox"
              aria-expanded={isOpen}
            />
            <ChevronDown
              className={cn(
                'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )}
            />

            {isOpen && (
              <div className="admin-raised-hover admin-scroll absolute z-50 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading companies
                  </div>
                ) : (
                  <>
                    {filteredCompanies.length > 0
                      ? filteredCompanies.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleSelect(company)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
                          >
                            <MediaTile className="h-8 w-8">
                              {company.logo_url ? (
                                <UniversalImage
                                  src={company.logo_url}
                                  alt={company.name}
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 object-cover"
                                />
                              ) : (
                                <Building2 className="h-3.5 w-3.5" />
                              )}
                            </MediaTile>
                            <span className="truncate text-sm text-foreground">
                              {company.name}
                            </span>
                          </button>
                        ))
                      : searchQuery && (
                          <p className="px-3 py-3 text-center text-xs text-muted-foreground">
                            No companies match &ldquo;{searchQuery}&rdquo;
                          </p>
                        )}

                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="mt-1 flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                        <Plus className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="truncate text-sm text-primary">
                        {searchQuery
                          ? `Create "${searchQuery}"`
                          : 'Create new company'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={showForm}
        onOpenChange={(open) => !open && closeForm()}
        title={isEditing ? 'Edit company' : 'New company'}
        description="Logos are shared across every role linked to this company."
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={busy || isEmpty(formData.name.trim())}
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {committingUpload
                ? 'Uploading...'
                : isEditing
                  ? 'Save changes'
                  : 'Create company'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Company name" htmlFor="selector-name" required>
            <Input
              id="selector-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Acme Corporation"
              autoFocus
            />
          </Field>

          <Field label="Website" htmlFor="selector-website">
            <Input
              id="selector-website"
              type="url"
              value={formData.website_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website_url: e.target.value }))
              }
              placeholder="https://example.com"
            />
          </Field>

          <Field label="Logo" hint="Upload a square image or paste a URL.">
            <UniversalUpload
              ref={uploadRef}
              uploadType="company_logo"
              entityId={formData.id}
              value={formData.logo_url}
              onChange={(url: string) =>
                setFormData((prev) => ({ ...prev, logo_url: url }))
              }
              enableCrop={true}
              cropAspect={1}
              allowUrlInput={true}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
