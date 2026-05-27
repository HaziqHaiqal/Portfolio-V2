'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createBrowserSupabase } from '@lib/supabase/browser';
import { upsertCompanyAction } from '@app/admin/_actions/companies';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import { Building, Plus, Search, X, Check, Loader2, Edit } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Company } from '@lib/supabase';
import UniversalUpload, {
  type UniversalUploadHandle,
} from './UniversalUpload';
import UniversalImage from './UniversalImage';

interface CompanySelectorProps {
  value: Company | null;
  onChange: (company: Company | null) => void;
}

export default function CompanySelector({ value, onChange }: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', logo_url: '', website_url: '' });
  const [saving, setSaving] = useState(false);
  const [committingUpload, setCommittingUpload] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<UniversalUploadHandle>(null);
  const supabase = useMemo(() => createBrowserSupabase(), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    // Generate UUID upfront so logo upload works immediately
    setFormData({
      id: crypto.randomUUID(),
      name: searchQuery,
      logo_url: '',
      website_url: '',
    });
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
      if (isEditing) {
        const existingCompany = companies.find((c) => c.id === formData.id);
        if (existingCompany?.name !== trimmedName) {
          const duplicate = companies.find(
            (c) =>
              c.name.toLowerCase() === trimmedName.toLowerCase() &&
              c.id !== formData.id,
          );
          if (duplicate) {
            toast.error(
              `Company "${trimmedName}" already exists. Please use a different name.`,
            );
            return;
          }
        }

        const updated = await upsertCompanyAction({
          id: formData.id,
          name: trimmedName,
          logo_url: logoUrl || undefined,
          website_url: formData.website_url || undefined,
        });
        toast.success('Company updated successfully');
        await loadCompanies();
        if (value?.id === formData.id) onChange(updated);
      } else {
        const duplicate = companies.find(
          (c) => c.name.toLowerCase() === trimmedName.toLowerCase(),
        );
        if (duplicate) {
          toast.error(
            `Company "${trimmedName}" already exists. Please select it from the list instead.`,
          );
          return;
        }

        const created = await upsertCompanyAction({
          id: formData.id,
          name: trimmedName,
          logo_url: logoUrl || undefined,
          website_url: formData.website_url || undefined,
        });
        toast.success('Company created successfully');
        await loadCompanies();
        onChange(created);
      }

      setShowForm(false);
      setFormData({ id: '', name: '', logo_url: '', website_url: '' });
    } catch (error: unknown) {
      console.error('Error saving company:', error);
      const msg =
        error instanceof Error ? error.message : 'Failed to save company';
      if (msg.includes('23505') || msg.toLowerCase().includes('duplicate')) {
        toast.error(
          `Company "${trimmedName}" already exists. Please use a different name.`,
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (company: Company) => {
    onChange(company);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <Label className="text-sm font-medium text-gray-300">
        Company <span className="text-red-500">*</span>
      </Label>

      {/* Selected Company Display */}
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
          {value.logo_url ? (
            <UniversalImage
              src={value.logo_url}
              alt={value.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
              <Building className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <span className="flex-1 text-white font-medium">{value.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openEditForm(value)}
            className="text-gray-400 hover:text-white hover:bg-gray-600"
            title="Edit company"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-gray-400 hover:text-white hover:bg-gray-600"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search or create company..."
              className="pl-10 bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(company => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleSelect(company)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left"
                      >
                        {company.logo_url ? (
                          <UniversalImage
                            src={company.logo_url}
                            alt={company.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center">
                            <Building className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-white">{company.name}</span>
                      </button>
                    ))
                  ) : searchQuery && (
                    <div className="p-3 text-gray-400 text-sm text-center">
                      No companies found
                    </div>
                  )}

                  {/* Create New Company Option */}
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left border-t border-gray-700"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-400">
                      {searchQuery ? `Create "${searchQuery}"` : 'Create new company'}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Company Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-500" />
                {isEditing ? 'Edit Company' : 'Create New Company'}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ id: '', name: '', logo_url: '', website_url: '' });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-300">Company Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Google, Microsoft"
                  className="mt-1 bg-gray-700 border-gray-600 text-white"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-sm text-gray-300">Website URL</Label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://example.com"
                  type="url"
                  className="mt-1 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-sm text-gray-300">Company Logo</Label>
                <p className="text-xs text-gray-500 mb-2">Upload an image or paste a URL</p>
                <UniversalUpload
                  ref={uploadRef}
                  uploadType="company_logo"
                  entityId={formData.id}
                  value={formData.logo_url}
                  onChange={(url: string) => setFormData(prev => ({ ...prev, logo_url: url }))}
                  enableCrop={true}
                  cropAspect={1}
                  allowUrlInput={true}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ id: '', name: '', logo_url: '', website_url: '' });
                }}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || committingUpload || isEmpty(formData.name.trim())}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {committingUpload ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {isEditing ? 'Save Changes' : 'Create Company'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
